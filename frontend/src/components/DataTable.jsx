import React, { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

export default function DataTable({ data, columns }) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search */}
      <div>
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Buscar en la tabla..."
          style={searchStyle}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{ borderBottom: '2px solid #DDD5C8' }}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#5C5845',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' && ' ↑'}
                    {header.column.getIsSorted() === 'desc' && ' ↓'}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: '1px solid #EDE8DF',
                    background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF7',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,124,53,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#FAFAF7'}
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      style={{
                        padding: '11px 14px',
                        fontSize: '0.875rem',
                        color: '#1A1A14',
                        borderBottom: 'none',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ padding: '2rem', textAlign: 'center', color: '#9A9282', fontSize: '0.875rem' }}
                >
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={paginationWrap}>
        <span style={paginationInfo}>
          {totalRows === 0 ? 'Sin resultados' : `${startRow}–${endRow} de ${totalRows}`}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            style={selectStyle}
          >
            {[10, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n} por página</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <PagBtn onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>«</PagBtn>
            <PagBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>‹</PagBtn>
            <PagBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>›</PagBtn>
            <PagBtn onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>»</PagBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

function PagBtn({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        border: '1.5px solid #DDD5C8',
        borderRadius: 6,
        background: disabled ? '#F4EFE6' : '#FFFFFF',
        color: disabled ? '#9A9282' : '#1A1A14',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'inherit',
        transition: 'background 0.12s',
      }}
    >
      {children}
    </button>
  )
}

const searchStyle = {
  padding: '0.55rem 0.875rem',
  border: '1.5px solid #DDD5C8',
  borderRadius: 8,
  fontSize: '0.875rem',
  width: '100%',
  maxWidth: 300,
  background: '#FFFFFF',
  color: '#1A1A14',
  fontFamily: "'Cabin', system-ui, sans-serif",
}

const paginationWrap = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
  paddingTop: '0.5rem',
  borderTop: '1px solid #EDE8DF',
}

const paginationInfo = {
  fontSize: '0.8rem',
  color: '#9A9282',
  fontWeight: 500,
}

const selectStyle = {
  padding: '0.3rem 0.6rem',
  border: '1.5px solid #DDD5C8',
  borderRadius: 6,
  fontSize: '0.8rem',
  background: '#FFFFFF',
  color: '#5C5845',
  fontFamily: "'Cabin', system-ui, sans-serif",
}
