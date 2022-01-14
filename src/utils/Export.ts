import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'

function convertToCsv(list: Array<any>) {
  let str = ''
  list.forEach((l: Array<string>) => str += l.join(',') + '\n')
  return str.toString()
}

export function toCsv(header: Array<any>, rows: Array<any>, fileName='document') {
    const csvContent = convertToCsv(header.concat(rows))
    const csvData = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute('id', 'csv')
    link.href = window.URL.createObjectURL(csvData);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove()
}

export function toTablePDF(
  tableColumns: Array<any>, 
  tableRows: Array<any>, 
  fileName='document',
  canHorizontalPageBreak=false) {
    const doc = new jsPDF()
    const title = doc.splitTextToSize(fileName, 180)
    const tableMarginStartY = title.length <= 1 ? 20 : title.length * 10
    doc.text(title, 14, 10)
    // Important note: only rendering the last array of headers. was experiencing bugs 
    // rendering multiple headers... maybe this can be improved later
    const config: any = {
      startY: tableMarginStartY,
      head: [tableColumns[tableColumns.length-1]],
      body: tableRows
    }
    if (canHorizontalPageBreak) {
      config.tableWidth = 'wrap'
      config.horizontalPageBreak = true
      config.horizontalPageBreakRepeat = 0
    }
    autoTable(doc, config)
    doc.save(`${fileName}.pdf`)
}
