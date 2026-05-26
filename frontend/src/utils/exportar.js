import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export function exportarExcel(datos, nombreArchivo, nombreHoja) {
  // Limpiar los datos para exportar solo campos simples si es necesario
  // Aquí los pasamos directo
  const worksheet = XLSX.utils.json_to_sheet(datos)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja)
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', type: 'array' 
  })
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  saveAs(blob, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportarCSV(datos, nombreArchivo) {
  const worksheet = XLSX.utils.json_to_sheet(datos)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.csv`)
}
