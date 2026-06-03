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
  item.month = item.dateObj.getMonth() + 1; // 1-12
});

headers.forEach(h => {
  h.amount_excl = parseFloat(h.amount_excl) || 0;
  h.tax_amount = parseFloat(h.tax_amount) || 0;
  h.total = h.amount_excl + h.tax_amount;
  h.dateObj = new Date(h.date);
  h.year = h.dateObj.getFullYear();
  h.month = h.dateObj.getMonth() + 1;
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

// Base Date is June 3, 2026
const baseDate = new Date('2026-06-03');

// Helper to filter dates
function filterRange(items, start, end) {
  return items.filter(item => item.dateObj >= start && item.dateObj < end);
}

// Periods definitions
const start3m = new Date('2026-03-03');
const start6m = new Date('2025-12-03');
const start12m = new Date('2025-06-03');
const start24m = new Date('2024-06-03');

// Previous periods definitions
const prevStart3m = new Date('2025-12-03'); // Prev 3m: Dec 3, 2025 to Mar 3, 2026
const prevStart6m = new Date('2025-06-03'); // Prev 6m: Jun 3, 2025 to Dec 3, 2025
const prevStart12m = new Date('2024-06-03'); // Prev 12m: Jun 3, 2024 to Jun 3, 2025

console.log('=== 1. LPG PURCHASE HISTORY COMPARISON ===');
const periodsList = [
  { name: 'Last 3M', start: start3m, end: baseDate, prevStart: prevStart3m, prevEnd: start3m },
  { name: 'Last 6M', start: start6m, end: baseDate, prevStart: prevStart6m, prevEnd: start6m },
  { name: 'Last 12M', start: start12m, end: baseDate, prevStart: prevStart12m, prevEnd: start12m }
];

periodsList.forEach(p => {
  const currentItems = filterRange(lpgItems, p.start, p.end);
  const prevItems = filterRange(lpgItems, p.prevStart, p.prevEnd);

  const curKg = currentItems.reduce((s, i) => s + i.total_kg, 0);
  const prevKg = prevItems.reduce((s, i) => s + i.total_kg, 0);

  const curRev = currentItems.reduce((s, i) => s + i.revenue, 0);
  const prevRev = prevItems.reduce((s, i) => s + i.revenue, 0);

  const curCost = currentItems.reduce((s, i) => s + i.total_cost, 0);
  const prevCost = prevItems.reduce((s, i) => s + i.total_cost, 0);

  const curMargin = curRev - curCost;
  const prevMargin = prevRev - prevCost;

  const curMarginPct = curRev > 0 ? (curMargin / curRev) * 100 : 0;
  const prevMarginPct = prevRev > 0 ? (prevMargin / prevRev) * 100 : 0;

  const curOrders = new Set(currentItems.filter(i => i.entry_type === 'Invoice').map(i => i.doc_no)).size;
  const prevOrders = new Set(prevItems.filter(i => i.entry_type === 'Invoice').map(i => i.doc_no)).size;

  console.log(`\n--- ${p.name} vs Previous ---`);
  console.log(`Volume (kg): Current = ${curKg.toFixed(2)}, Previous = ${prevKg.toFixed(2)} (${prevKg > 0 ? ((curKg - prevKg) / prevKg * 100).toFixed(1) : 0}%)`);
  console.log(`Revenue: Current = R${curRev.toFixed(2)}, Previous = R${prevRev.toFixed(2)} (${prevRev > 0 ? ((curRev - prevRev) / prevRev * 100).toFixed(1) : 0}%)`);
  console.log(`Margin %: Current = ${curMarginPct.toFixed(2)}%, Previous = ${prevMarginPct.toFixed(2)}%`);
  console.log(`Orders: Current = ${curOrders}, Previous = ${prevOrders}`);
});

console.log('\n=== 2. PRODUCT MIX TRENDS (Last 24 Months) ===');
// Let's divide last 24m into 4 quarters or 2 periods of 12m
const year1 = filterRange(lpgItems, start24m, start12m);
const year2 = filterRange(lpgItems, start12m, baseDate);

const printMix = (label, itemsList) => {
  const total = itemsList.reduce((s, i) => s + i.total_kg, 0);
  console.log(`\nPeriod: ${label} (Total: ${total.toFixed(2)} kg)`);
  ['9kg', '14kg', '19kg', '48kg'].forEach(size => {
    const sItems = itemsList.filter(i => i.size === size);
    const kg = sItems.reduce((s, i) => s + i.total_kg, 0);
    const pct = total > 0 ? (kg / total * 100) : 0;
    const qty = sItems.reduce((s, i) => s + i.qty, 0);
    console.log(`  Size ${size}: ${qty.toFixed(0)} cyl, ${kg.toFixed(2)} kg (${pct.toFixed(1)}%)`);
  });
};

printMix('Year 1 (Jun 2024 - Jun 2025)', year1);
printMix('Year 2 (Jun 2025 - Jun 2026)', year2);

console.log('\n=== 3. OPERATIONAL METRICS ===');
// Order frequency: Let's list all invoice dates for BU0009
const activeInvoices = lpgItems
  .filter(i => i.account_no === 'BU0009' && i.entry_type === 'Invoice')
  .map(i => i.date)
  .filter((v, i, self) => self.indexOf(v) === i)
  .sort((a, b) => new Date(a) - new Date(b));

console.log(`Total unique invoice dates in active account: ${activeInvoices.length}`);
const diffs = [];
for (let i = 1; i < activeInvoices.length; i++) {
  const d1 = new Date(activeInvoices[i - 1]);
  const d2 = new Date(activeInvoices[i]);
  const diffDays = (d2 - d1) / (1000 * 60 * 60 * 24);
  diffs.push(diffDays);
}

const avgDays = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
console.log(`Average days between orders: ${avgDays.toFixed(1)} days`);

const lastOrderDate = new Date(activeInvoices[activeInvoices.length - 1]);
const daysSinceLast = (baseDate - lastOrderDate) / (1000 * 60 * 60 * 24);
console.log(`Last order date: ${activeInvoices[activeInvoices.length - 1]}`);
console.log(`Days since last order: ${daysSinceLast.toFixed(0)} days`);

// Typical reorder quantity (average kg/cylinders per order)
const orderQuantities = {};
lpgItems.filter(i => i.account_no === 'BU0009' && i.entry_type === 'Invoice').forEach(i => {
  orderQuantities[i.doc_no] = (orderQuantities[i.doc_no] || 0) + i.qty;
});
const qtys = Object.values(orderQuantities);
const avgOrderQty = qtys.reduce((s, q) => s + q, 0) / qtys.length;
console.log(`Typical order quantity (cylinders): ${avgOrderQty.toFixed(1)} cylinders`);

console.log('\n=== 4. SEASONALITY ANALYSIS (Monthly totals from 2024 to 2026) ===');
const monthlyTotals = {};
lpgItems.filter(i => i.dateObj >= new Date('2024-01-01')).forEach(i => {
  const key = `${i.year}-${String(i.month).padStart(2, '0')}`;
  monthlyTotals[key] = (monthlyTotals[key] || 0) + i.total_kg;
});
console.log('Monthly LPG sales volumes (kg) 2024-2026:');
Object.keys(monthlyTotals).sort().forEach(k => {
  console.log(`  ${k}: ${monthlyTotals[k].toFixed(2)} kg`);
});

// Let's look at prices and margins for 9kg in recent months (trend)
console.log('\n=== 5. 9KG PRICE AND MARGIN TREND ===');
const recent9kg = lpgItems
  .filter(i => i.size === '9kg' && i.dateObj >= new Date('2025-01-01'))
  .sort((a, b) => a.dateObj - b.dateObj);

const monthly9kg = {};
recent9kg.forEach(i => {
  const key = `${i.year}-${String(i.month).padStart(2, '0')}`;
  if (!monthly9kg[key]) monthly9kg[key] = { qty: 0, rev: 0, cost: 0 };
  monthly9kg[key].qty += i.qty;
  monthly9kg[key].rev += i.revenue;
  monthly9kg[key].cost += i.total_cost;
});

Object.keys(monthly9kg).sort().forEach(k => {
  const m = monthly9kg[k];
  const avgPrice = m.qty > 0 ? m.rev / m.qty : 0;
  const avgCost = m.qty > 0 ? m.cost / m.qty : 0;
  const margin = m.rev - m.cost;
  const marginPct = m.rev > 0 ? (margin / m.rev * 100) : 0;
  console.log(`  Month ${k}: Qty = ${m.qty.toFixed(0)}, Avg Selling Price = R${avgPrice.toFixed(2)}, Avg Cost = R${avgCost.toFixed(2)}, Margin = R${margin.toFixed(2)} (${marginPct.toFixed(1)}%)`);
});

console.log('\n=== 6. ASSESSING CUSTOMER CLAIM: "Gas is selling slowly now" ===');
// Customer statement: "Gas is selling slowly now"
// Check order sizes and frequencies in recent months (e.g. Feb, Mar, Apr, May 2026)
const months2026 = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
console.log('Detailed 2026 monthly volumes and order count:');
months2026.forEach(m => {
  const mItems = lpgItems.filter(i => `${i.year}-${String(i.month).padStart(2, '0')}` === m);
  const kg = mItems.reduce((s, i) => s + i.total_kg, 0);
  const orders = new Set(mItems.filter(i => i.entry_type === 'Invoice').map(i => i.doc_no)).size;
  console.log(`  Month ${m}: Total Vol = ${kg.toFixed(2)} kg, Orders = ${orders}`);
});

