import fs from 'fs';

// Load data
const items = JSON.parse(fs.readFileSync('scripts/impendle_items.json', 'utf8'));
const headers = JSON.parse(fs.readFileSync('scripts/impendle_headers.json', 'utf8'));

// Convert types
items.forEach(item => {
  item.qty = parseFloat(item.qty) || 0;
  item.price = parseFloat(item.price) || 0;
  item.cost = parseFloat(item.cost) || 0;
  item.tax = parseFloat(item.tax) || 0;
  item.dateObj = new Date(item.date);
  item.year = item.dateObj.getFullYear();
});

headers.forEach(h => {
  h.amount_excl = parseFloat(h.amount_excl) || 0;
  h.tax_amount = parseFloat(h.tax_amount) || 0;
  h.total = h.amount_excl + h.tax_amount;
  h.dateObj = new Date(h.date);
  h.year = h.dateObj.getFullYear();
});

// Helper to determine size and gas weight
function getSKUDetails(item) {
  const stockNo = (item.stock_no || '').trim().toUpperCase();
  const desc = (item.description || '').trim().toUpperCase();

  // Exclude deposit SKUs
  if (stockNo.endsWith('.1') || stockNo.endsWith('.2') || desc.includes('DEPOSIT') || desc.includes('DEP')) {
    return { isLPG: false, size: 'deposit', weight: 0 };
  }

  if (stockNo === 'MIXED FOWL FEED 10KG' || stockNo === '00910006' || stockNo === '00420014' || stockNo === '00000130' || stockNo === '00000341' || stockNo === '00000345' || stockNo === '00000398' || stockNo === '00000368' || stockNo === '00000371' || stockNo === '00000367' || stockNo === '00000378' || stockNo === 'DEL') {
    return { isLPG: false, size: 'other', weight: 0 };
  }

  // 48kg
  if (stockNo.startsWith('D.') || stockNo.startsWith('S.') || stockNo.startsWith('D0') || stockNo.startsWith('S0') || desc.includes('48KG')) {
    return { isLPG: true, size: '48kg', weight: 48 };
  }
  // 19kg
  if (stockNo.startsWith('19.') || stockNo === '1901' || desc.includes('19KG')) {
    return { isLPG: true, size: '19kg', weight: 19 };
  }
  // 14kg
  if (stockNo.startsWith('14.') || stockNo === '1401' || desc.includes('14KG')) {
    return { isLPG: true, size: '14kg', weight: 14 };
  }
  // 9kg
  if (stockNo.startsWith('9.') || stockNo === '901' || desc.includes('9KG')) {
    return { isLPG: true, size: '9kg', weight: 9 };
  }

  if (stockNo === 'LPG-03' || desc.includes('LPG FILL') || desc.includes('LPG REFILL')) {
    return { isLPG: true, size: '9kg', weight: 9 };
  }

  return { isLPG: false, size: 'unknown', weight: 0 };
}

// Add metadata
items.forEach(item => {
  const details = getSKUDetails(item);
  item.isLPG = details.isLPG;
  item.size = details.size;
  item.weight = details.weight;
  item.total_kg = item.qty * item.weight;
  item.revenue = item.qty * item.price;
  item.total_cost = item.qty * item.cost;
  item.gross_margin = item.revenue - item.total_cost;
});

const lpgItems = items.filter(item => item.isLPG);

// 1. Annual totals
console.log('\n=== ANNUAL LPG SALES HISTORY ===');
const years = [...new Set(lpgItems.map(i => i.year))].sort();
years.forEach(y => {
  const yItems = lpgItems.filter(i => i.year === y);
  const totalKg = yItems.reduce((sum, item) => sum + item.total_kg, 0);
  const revenue = yItems.reduce((sum, item) => sum + item.revenue, 0);
  const cost = yItems.reduce((sum, item) => sum + item.total_cost, 0);
  const margin = revenue - cost;
  const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;
  const avgPricePerKg = totalKg > 0 ? revenue / totalKg : 0;
  const orders = new Set(yItems.filter(i => i.entry_type === 'Invoice').map(i => i.doc_no)).size;

  console.log(`Year ${y}:`);
  console.log(`  Total LPG kg: ${totalKg.toFixed(2)}`);
  console.log(`  Total Revenue: R${revenue.toFixed(2)}`);
  console.log(`  Avg Price/kg: R${avgPricePerKg.toFixed(2)}`);
  console.log(`  Est Margin: R${margin.toFixed(2)} (${marginPct.toFixed(2)}%)`);
  console.log(`  Orders: ${orders}`);
});

// 2. Current balances
console.log('\n=== CURRENT BALANCES ===');
['BU0003', 'BU0009'].forEach(acc => {
  const accHeaders = headers.filter(h => h.account_no === acc);
  const totalBalance = accHeaders.reduce((sum, h) => sum + h.total, 0);
  
  // Breakdown of entry types in headers
  const types = {};
  accHeaders.forEach(h => {
    types[h.entry_type] = (types[h.entry_type] || 0) + h.total;
  });

  console.log(`Account: ${acc}`);
  console.log(`  Current Balance (cumulative total of all entries): R${totalBalance.toFixed(2)}`);
  console.log('  Breakdown by entry type:');
  for (const t in types) {
    console.log(`    ${t}: R${types[t].toFixed(2)}`);
  }
});

// 3. Sales rep assigned
console.log('\n=== SALES REPS ASSIGNED ===');
['BU0003', 'BU0009'].forEach(acc => {
  const accItems = items.filter(i => i.account_no === acc && i.isLPG);
  const reps = {};
  accItems.forEach(i => {
    const repKey = `${i.rep_code} - ${i.rep_name}`;
    reps[repKey] = (reps[repKey] || 0) + i.revenue;
  });
  console.log(`Account: ${acc}`);
  console.log(reps);
});

// 4. First transaction date
console.log('\n=== FIRST TRANSACTION DATE ===');
['BU0003', 'BU0009'].forEach(acc => {
  const accItems = items.filter(i => i.account_no === acc);
  if (accItems.length > 0) {
    console.log(`Account ${acc} First Transaction Date: ${accItems[0].date}`);
  }
});
