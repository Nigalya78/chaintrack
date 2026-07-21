import jsPDF from "jspdf"

export function exportToPDF(data: any[], columns: string[], filename: string) {
  const doc = new jsPDF()
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 10
  const tableWidth = pageWidth - 2 * margin
  const colWidth = tableWidth / columns.length
  const rowHeight = 10
  
  let y = margin + 20
  
  doc.setFontSize(16)
  doc.text(filename, margin, margin)
  
  doc.setFontSize(10)
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, y, tableWidth, rowHeight, "F")
  
  columns.forEach((col, i) => {
    doc.text(col, margin + i * colWidth + 2, y + 7)
  })
  
  y += rowHeight
  
  data.forEach((row) => {
    if (y > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
    
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, y, tableWidth, rowHeight, "F")
    
    Object.values(row).forEach((value, i) => {
      doc.text(String(value), margin + i * colWidth + 2, y + 7)
    })
    
    y += rowHeight
  })
  
  doc.save(`${filename}.pdf`)
}
