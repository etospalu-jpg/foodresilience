export function csvCell(value:unknown){
  const text=value===null||value===undefined?"":String(value);
  return '"'+text.replaceAll('"','""')+'"';
}
export function toCsv(headers:string[],rows:unknown[][]){
  return "\uFEFF"+[headers,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n");
}
