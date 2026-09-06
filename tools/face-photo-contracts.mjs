// Proposed engineering tolerances, not validated human-rating accuracy thresholds.
// Refused originals provide refusal coverage but cannot form score-difference pairs.
export function assessPhotoAudit(rows,errors,imageCount) {
  const checks=[
    {name:'all originals attempted',pass:rows.filter(r=>r.variant==='original').length===imageCount},
    {name:'all planned perturbations attempted',pass:rows.length===imageCount+48},
    {name:'usable originals remain scorable',pass:rows.filter(r=>r.variant==='original'&&r.scored).length>=6},
    {name:'all eight low-resolution probes are refused',pass:rows.filter(r=>r.variant==='small').length===8 && rows.filter(r=>r.variant==='small').every(r=>!r.scored)},
    {name:'no browser runtime exceptions',pass:errors.length===0},
    {name:'every run settled as a score or explicit refusal',pass:rows.every(r=>r.scored || /Photo not scored|No face found|too small|too far off|bad landmarks|Incomplete face/.test(r.status))},
  ];
  const limits={repeat:.1,mirror:.25,dim:.5,blur:.5,roll8:.5};
  for(const row of rows.filter(r=>r.variant!=='original')) {
    const base=rows.find(r=>r.url===row.url&&r.variant==='original');
    if(!base?.scored)continue;
    if(row.variant==='small') {
      checks.push({name:`${row.url}: reject 96px-wide source`,pass:!row.scored,score:row.score});
    } else {
      const delta=row.scored?Math.abs(row.score-base.score):null;
      // Refusing a transformed input is allowed; scoring it invokes the stability contract.
      checks.push({name:`${row.url}: ${row.variant}`,pass:!row.scored||delta<=limits[row.variant],delta,limit:limits[row.variant]});
    }
  }
  return checks;
}