// Decomposition of the COF002 standing balance at 2025-02-24 (ASSERTED, scratch). Usage: node cof002_floor_decomposition.mjs <dir with COF002_DEBENQ_{2023,2024,2025,CURRENT}.TXT from fd8a268>
import fs from 'fs';
const parse=(f)=>{const rows=[];for(const l of fs.readFileSync(f,'utf8').split(/\r?\n/)){const c=l.match(/"((?:[^"]|"")*)"/g)?.map(x=>x.slice(1,-1));if(c&&/^\d+$/.test(c[0])&&c[3])rows.push({doc:c[2],entry:c[3],date:c[4].split('/').reverse().join('-'),amt:Math.round(+c[9]*100)});}return rows;};
const d=process.argv[2];
const all=['2023','2024','2025','CURRENT'].flatMap(k=>parse(d+`/COF002_DEBENQ_${k}.TXT`)).filter(r=>r.date<='2025-02-24');
const total=all.reduce((s,r)=>s+r.amt,0);
const key=new Set(['00031096','00015669','00015919','00016179','00016394','00017260','00022838','00004076','00004274','00005689','00040384','00036657','00037735','00032598','00034681']);
const rest=all.filter(r=>!key.has(r.doc));
const sel=all.filter(r=>key.has(r.doc));
console.log('balance to 2025-02-24 (all rows dated <= that day):',total/100);
console.log('rows outside the 15 key documents sum to:',rest.reduce((s,r)=>s+r.amt,0)/100,'(count',rest.length+')');
console.log('key documents:');sel.forEach(r=>console.log(' ',r.doc,r.entry,r.date,r.amt/100));
console.log('key documents sum:',sel.reduce((s,r)=>s+r.amt,0)/100);
