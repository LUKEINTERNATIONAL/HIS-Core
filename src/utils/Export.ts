import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable'
import csvConverter from "convert-array-to-csv"

export function toCsv(header: Array<any>, rows: Array<any>, fileName='document') {
    const csvContent = "data:text/csv;charset=utf-8," + csvConverter(rows, { header, seperator: ';'})
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute('id', 'csv')
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.removeChild(link)
}

export function toTablePDF(tableColumns: Array<any>, tableRows: Array<any>, fileName='document') {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [tableColumns],
      body: tableRows
    })
    doc.save(`${fileName}.pdf`)
}
