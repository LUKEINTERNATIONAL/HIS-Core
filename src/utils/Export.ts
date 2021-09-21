import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'

function convertToCsv(list: Array<any>) {
  let str = ''
  list.forEach((l: Array<string>) => str += l.join(',') + '\n')
  return str.toString()
}

export function toCsv(header: Array<any>, rows: Array<any>, fileName='document') {
    const csvContent = convertToCsv([header].concat(rows))
    const csvData = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute('id', 'csv')
    link.href = window.URL.createObjectURL(csvData);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove()
}

export function toTablePDF(tableColumns: Array<any>, tableRows: Array<any>, fileName='document') {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows
    })
    doc.save(`${fileName}.pdf`)
}
