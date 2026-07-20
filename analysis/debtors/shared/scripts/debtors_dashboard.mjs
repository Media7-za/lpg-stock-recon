import fs from 'fs';
import path from 'path';

const baseDir = 'analysis/debtors';
const candidatesPath = path.join(baseDir, 'shared/data/portfolio_candidates.csv');
const humanTasksPath = path.join(baseDir, 'shared/HUMAN_TASKS.md');
const skipDirs = new Set(['shared', 'Global Reports']);

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - target.getTime();
  return Math.floor(diff / (1000 * 3600 * 24));
}

// Collections Intelligence Engine (Slice 005A)
function calculateIntelligence(p) {
  let riskScore = 0;
  
  // Weights (as defined in COLLECTIONS_INTELLIGENCE.md)
  if ((p.financials?.agedDebt180Plus || 0) > 0) riskScore += 30;
  if (p.financials?.lastPaymentDate && daysSince(p.financials.lastPaymentDate) > 90) riskScore += 25;
  if (p.collections?.dateSent && daysSince(p.collections.dateSent) > 14) riskScore += 20;
  if (p.collections?.actionType === 'letter-of-demand' && p.collections?.dateSent) riskScore += 15;
  if (p.reconState === 'complete') riskScore += 10;
  
  if (riskScore > 100) riskScore = 100;
  
  const daysSinceLastContact = p.collections?.dateSent ? daysSince(p.collections.dateSent) : 0;
  
  return { riskScore, daysSinceLastContact };
}

// Action Prompting Engine (Slice 005C)
function generateActionPrompt(p) {
  if (p.status !== 'collection' && p.status !== 'legal') return null;

  const total = formatCurrency(p.financials?.totalOutstanding || 0);
  const aged = formatCurrency(p.financials?.agedDebt180Plus || 0);
  let prompt = {
    reason: "",
    recommendedAction: "",
    suggestedMessage: ""
  };

  if (p.status === 'legal') {
    prompt.reason = `${total} total outstanding, currently in legal status.`;
    prompt.recommendedAction = p.collections?.nextAction || "Legal-stage follow-up";
    prompt.suggestedMessage = `Good day,\n\nThis account is currently under formal collections/legal review.\n\nThe outstanding balance of ${total} remains unpaid. Please arrange payment immediately or confirm, in writing, the status of your payment arrangement.\n\nFurther communication, non-payment, or failure to respond may result in the matter being escalated further without additional notice.\n\nKind regards`;
  } else if (p.status === 'collection') {
    prompt.reason = aged !== 'R0.00' ? `${aged} is over 180 days aged.` : `${total} is in arrears.`;
    prompt.recommendedAction = p.collections?.nextAction || "Send firm payment reminder / LOD precursor";
    prompt.suggestedMessage = `Hi, this is a reminder that your account currently has an outstanding balance of ${total}` + (aged !== 'R0.00' ? `, including ${aged} that is significantly overdue.` : `.`) + `\n\nPlease arrange payment urgently or contact us today to confirm a payment plan.\n\nIf no response or payment arrangement is received, the account may proceed further in the collections process.`;
  }

  return prompt;
}

// Function to scan and load all projects
function loadProjects() {
  const folders = fs.readdirSync(baseDir).filter(f => {
    try {
      return fs.statSync(path.join(baseDir, f)).isDirectory() && !skipDirs.has(f);
    } catch {
      return false;
    }
  });

  const projects = [];
  for (const code of folders) {
    const filePath = path.join(baseDir, code, 'project.json');
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        // Inject derived intelligence
        data._intelligence = calculateIntelligence(data);
        // Inject dynamic action prompt
        data._prompt = generateActionPrompt(data);
        projects.push(data);
      } catch (err) {
        console.error(`Error parsing ${filePath}:`, err.message);
      }
    }
  }
  
  // Sort by Priority Queue (Risk Score descending)
  projects.sort((a, b) => b._intelligence.riskScore - a._intelligence.riskScore);
  
  return projects;
}

// Function to format currency
function formatCurrency(val) {
  if (val === null || val === undefined) return 'R0.00';
  return 'R' + val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function loadPortfolioCandidates() {
  if (!fs.existsSync(candidatesPath)) {
    return { rows: [], globalBook: null, globalAged120: null, tierANotInPortfolio: 0 };
  }
  const text = fs.readFileSync(candidatesPath, 'utf8');
  const lines = text.trim().split('\n').slice(1);
  const rows = lines.map((line) => {
    const parts = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) {
        parts.push(cur);
        cur = '';
      } else cur += ch;
    }
    parts.push(cur);
    return {
      code: parts[0],
      balance: parseFloat(parts[3]) || 0,
      aged120: parseFloat(parts[4]) || 0,
      inPortfolio: parts[5] === 'yes',
      lane: parts[6],
      tier: parts[7],
    };
  });
  const tierANotInPortfolio = rows.filter((r) => r.tier === 'A' && !r.inPortfolio).length;
  const globalBook = rows.reduce((s, r) => s + r.balance, 0);
  const globalAged120 = rows.reduce((s, r) => s + r.aged120, 0);
  return { rows, globalBook, globalAged120, tierANotInPortfolio };
}

function countOpenHumanTasks() {
  if (!fs.existsSync(humanTasksPath)) return 0;
  const text = fs.readFileSync(humanTasksPath, 'utf8');
  return (text.match(/\| OPEN \|/g) || []).length;
}

function formatReconState(reconState) {
  if (reconState === 'complete') return '✅ Complete';
  if (reconState === 'in-progress') return '🔄 In Progress';
  return '⏳ Pending';
}

// Function to render console dashboard
function renderConsole(projects) {
  console.log('\n========================================================================================================');
  console.log('                 LPG STOCK RECON — DEBTORS PRIORITY QUEUE & METRICS');
  console.log('========================================================================================================');
  
  // Table headers
  const headers = [
    'Risk'.padEnd(4),
    'Code'.padEnd(8),
    'Client Name'.padEnd(25),
    'Recon State'.padEnd(12),
    'Status'.padEnd(15),
    'Outstanding'.padStart(15),
    'Aged 180d+'.padStart(12),
    'Next Action'.padEnd(20)
  ];
  console.log(headers.join(' | '));
  console.log('-'.repeat(120));

  let totalOutstanding = 0;
  let totalAged = 0;

  for (const p of projects) {
    const risk = p._intelligence.riskScore.toString();
    const code = p.debtorCode || '';
    const name = (p.clientName || '').substring(0, 25);
    const recon = p.reconState || '';
    const status = p.status || '';
    const outVal = p.financials?.totalOutstanding || 0;
    const agedVal = p.financials?.agedDebt180Plus || 0;
    const nextAction = p.collections?.nextAction || (p.collections?.actionRequired ? (p.collections.actionType || 'Follow-up') : 'None');

    totalOutstanding += outVal;
    totalAged += agedVal;

    // Add status symbols for console
    let statusStr = status.toUpperCase();
    if (status === 'collection') statusStr = '⚠️ ' + statusStr;
    else if (status === 'active') statusStr = '🟢 ' + statusStr;
    else if (status === 'on-hold') statusStr = '🟡 ' + statusStr;
    else if (status === 'resolved') statusStr = '🔵 ' + statusStr;

    console.log([
      risk.padEnd(4),
      code.padEnd(8),
      name.padEnd(25),
      recon.padEnd(12),
      statusStr.padEnd(15),
      formatCurrency(outVal).padStart(15),
      formatCurrency(agedVal).padStart(12),
      nextAction.substring(0, 20).padEnd(20)
    ].join(' | '));
  }

  console.log('-'.repeat(120));
  console.log([
    ''.padEnd(4),
    'TOTALS'.padEnd(8),
    `${projects.length} Accounts`.padEnd(25),
    ''.padEnd(12),
    ''.padEnd(15),
    formatCurrency(totalOutstanding).padStart(15),
    formatCurrency(totalAged).padStart(12),
    ''.padEnd(20)
  ].join(' | '));
  console.log('========================================================================================================\n');
}

// Function to generate Markdown Dashboard file
function generateMarkdown(projects, outputPath) {
  let totalOutstanding = 0;
  let totalAged = 0;
  let reconCompleteCount = 0;
  let reconInProgressCount = 0;
  let collectionCount = 0;
  let legalCount = 0;
  let lodIssuedCount = 0;
  let awaitingResponseCount = 0;
  let collectionBlockedOutstanding = 0;

  for (const p of projects) {
    const outVal = p.financials?.totalOutstanding || 0;
    totalOutstanding += outVal;
    totalAged += p.financials?.agedDebt180Plus || 0;

    if (p.reconState === 'complete') reconCompleteCount++;
    else if (p.reconState === 'in-progress') reconInProgressCount++;
    if (p.reconState !== 'complete') collectionBlockedOutstanding += outVal;

    if (p.status === 'collection') collectionCount++;
    if (p.status === 'legal') legalCount++;

    if (p.collections?.actionType === 'letter-of-demand') {
      lodIssuedCount++;
      if (p.collections?.dateSent && daysSince(p.collections.dateSent) <= 14) {
        awaitingResponseCount++;
      }
    }
  }

  const reconPendingCount = projects.length - reconCompleteCount - reconInProgressCount;
  const candidates = loadPortfolioCandidates();
  const openHumanTasks = countOpenHumanTasks();

  let md = `# Debtors Portfolio Management Dashboard\n\n`;
  md += `*Last Updated: ${new Date().toISOString().split('T')[0]}*\n\n`;
  md += `> **View dashboard:** \`npm run debtors:sync\` then read this file. Orchestrator skill: \`.agents/skills/SKILL_Debtors_Orchestrator.md\`\n\n`;

  md += `## 🎯 Orchestrator KPIs\n\n`;
  md += `| KPI | Value |\n`;
  md += `|---|---|\n`;
  md += `| **Recon in progress** | ${reconInProgressCount} |\n`;
  md += `| **Collection-blocked exposure** (recon ≠ complete, actionable) | **${formatCurrency(collectionBlockedOutstanding)}** |\n`;
  md += `| **Open human tasks** | ${openHumanTasks} ([queue](analysis/debtors/shared/HUMAN_TASKS.md)) |\n`;
  md += `| **Tier A backlog (not in portfolio)** | ${candidates.tierANotInPortfolio} |\n`;
  if (fs.existsSync(candidatesPath)) {
    md += `| **Backlog candidates (parsed)** | ${candidates.rows.length} ([CSV](analysis/debtors/shared/data/portfolio_candidates.csv)) |\n`;
  } else {
    md += `| **Backlog candidates** | — run \`npm run debtors:parse-backlog\` |\n`;
  }
  md += `| **Recon complete rate** | ${projects.length ? Math.round((reconCompleteCount / projects.length) * 100) : 0}% (${reconCompleteCount}/${projects.length}) |\n\n`;

  // Slice 005B: Expanded Portfolio Metrics
  md += `## 📊 Portfolio Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|---|---|\n`;
  md += `| **Accounts** | ${projects.length} |\n`;
  md += `| **Recon Complete** | ${reconCompleteCount} |\n`;
  md += `| **Recon In Progress** | ${reconInProgressCount} |\n`;
  md += `| **Recon Pending** | ${reconPendingCount} |\n`;
  md += `| **Collection Active** | ${collectionCount} |\n`;
  md += `| **Legal** | ${legalCount} |\n`;
  md += `| **Total Outstanding** | **${formatCurrency(totalOutstanding)}** |\n`;
  md += `| **180+ Debt** | **${formatCurrency(totalAged)}** |\n`;
  md += `| **LOD Issued** | ${lodIssuedCount} |\n`;
  md += `| **Awaiting Response** | ${awaitingResponseCount} |\n\n`;

  md += `## 📋 Priority Queue\n\n`;
  md += `Accounts are automatically sorted by Risk Score using the Collections Intelligence Engine.\n\n`;
  md += `| Risk | Code | Client Name | Recon State | Workflow Status | Outstanding | Aged 180d+ | Next Action |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  for (const p of projects) {
    const risk = p._intelligence.riskScore;
    const code = p.debtorCode || '';
    const name = p.clientName || '';
    const recon = formatReconState(p.reconState);
    
    let statusStr = p.status.toUpperCase();
    if (p.status === 'collection') statusStr = '🔴 COLLECTION';
    else if (p.status === 'active') statusStr = '🟢 ACTIVE';
    else if (p.status === 'on-hold') statusStr = '🟡 ON HOLD';
    else if (p.status === 'resolved') statusStr = '🔵 RESOLVED';

    const outstanding = formatCurrency(p.financials?.totalOutstanding || 0);
    const aged = formatCurrency(p.financials?.agedDebt180Plus || 0);
    
    let actionStr = 'None';
    if (p.collections?.nextAction) {
      actionStr = `⚠️ **${p.collections.nextAction}**`;
      if (p.collections?.nextActionDate) {
        actionStr += ` (by ${p.collections.nextActionDate})`;
      }
    } else if (p.collections?.actionRequired) {
      const type = p.collections.actionType || 'Action needed';
      const deadline = p.collections.deadlineDate ? ` (by ${p.collections.deadlineDate})` : '';
      actionStr = `⚠️ **${type}**${deadline}`;
    }

    md += `| **${risk}** | [${code}](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/${code}/) | ${name} | ${recon} | ${statusStr} | ${outstanding} | ${aged} | ${actionStr} |\n`;
  }

  md += `\n---\n\n`;
  md += `*Document auto-generated by the local debtors dashboard script (\`analysis/debtors/shared/scripts/debtors_dashboard.mjs\`)*\n`;

  fs.writeFileSync(outputPath, md, 'utf8');
  console.log(`Markdown dashboard written to: ${outputPath}`);
}

// Function to generate the Human Prompt Cards (Slice 005C)
function generateActionPromptsMarkdown(projects, outputPath) {
  let md = `# Debtor Action Prompts\n\n`;
  md += `*Generated: ${new Date().toISOString().split('T')[0]}*\n\n`;
  md += `> **HUMAN EXECUTION QUEUE**: Agents must present these prompts to a human for approval and sending. Agents do NOT send these automatically. Once sent by the human, the agent must update the \`history\` array in the debtor's \`project.json\`.\n\n`;

  let promptCount = 0;
  for (const p of projects) {
    if (p._prompt && p._intelligence.riskScore > 0) {
      promptCount++;
      const code = p.debtorCode || '';
      const name = p.clientName || '';
      md += `## ${code} — ${name}\n`;
      md += `- **Reason:** ${p._prompt.reason}\n`;
      md += `- **Recommended Action:** ${p._prompt.recommendedAction}\n`;
      md += `- **Suggested Message:**\n\n`;
      md += `> ` + p._prompt.suggestedMessage.replace(/\n/g, '\n> ') + `\n\n`;
      md += `---\n\n`;
    }
  }

  if (promptCount === 0) {
    md += `*No actionable items require human prompting at this time.*\n`;
  }

  fs.writeFileSync(outputPath, md, 'utf8');
  console.log(`Markdown Action Prompts written to: ${outputPath}`);
}

const projects = loadProjects();
renderConsole(projects);
generateMarkdown(projects, 'DEBTORS_DASHBOARD.md');
generateActionPromptsMarkdown(projects, 'analysis/debtors/shared/ACTION_PROMPTS.md');
