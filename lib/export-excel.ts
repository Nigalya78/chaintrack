import * as XLSX from "xlsx"

export function exportToExcel(data: any[], columns: string[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((row) => {
      const obj: any = {}
      columns.forEach((col, i) => {
        obj[col] = Object.values(row)[i]
      })
      return obj
    })
  )
  
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
  
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}
