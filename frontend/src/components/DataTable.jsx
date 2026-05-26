import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Icon } from './Icon.jsx'

export default function DataTable({ data, columns, emptyMessage = 'No hay datos disponibles.' }) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Search */}
      <div style={searchWrap}>
        <span style={searchIcon}><Icon name="search" size={14} /></span>
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Buscar en la tabla..."
          style={searchInput}
        />
      </div>

      {/* Table */}
      <div style={tableScroll}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ ...thStyle, cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && (
                        <span style={{ color: '#166534', lineHeight: 0 }}><Icon name="arrow-up" size={11} /></span>
                      )}
                      {header.column.getIsSorted() === 'desc' && (
                        <span style={{ color: '#166534', lineHeight: 0 }}><Icon name="arrow-down" size={11} /></span>
                      )}
                    </span>
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
                  style={{ background: i % 2 === 0 ? '#FFFFFF' : '#F7FAF4', transition: 'background 80ms ease' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#DCFCE7'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#FFFFFF' : '#F7FAF4'}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={tdStyle}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={emptyStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#9CA3AF' }}>
                    <Icon name="search" size={26} />
                    <span style={{ fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={paginationWrap}>
        <span style={paginationInfo}>
          {totalRows === 0
            ? 'Sin resultados'
            : <>Mostrando <strong style={{ color: '#111827' }}>{startRow}–{endRow}</strong> de <strong style={{ color: '#111827' }}>{totalRows}</strong></>}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            style={selectStyle}
          >
            {[10, 25, 50, 100].map(n => (
              <option key={n} value={n}>{n} por página</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 3 }}>
            <PagBtn onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <Icon name="chevron-left" size={13} /><Icon name="chevron-left" size={13} style={{ marginLeft: -9 }} />
            </PagBtn>
            <PagBtn onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <Icon name="chevron-left" size={13} />
            </PagBtn>
            <PagBtn onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <Icon name="chevron-right" size={13} />
            </PagBtn>
            <PagBtn onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <Icon name="chevron-right" size={13} /><Icon name="chevron-right" size={13} style={{ marginLeft: -9 }} />
            </PagBtn>
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
        minWidth: 32, height: 32, padding: '0 7px',
        border: '1.5px solid #D5DAD0',
        borderRadius: 7,
        background: disabled ? '#F7FAF4' : '#FFFFFF',
        color: disabled ? '#9CA3AF' : '#374151',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'inherit',
        transition: 'background 100ms ease, border-color 100ms ease',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = '#F2F5EF'; e.currentTarget.style.borderColor = '#B8C4B4'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D5DAD0'; } }}
    >
      {children}
    </button>
  )
}

/* ── Styles ──────────────────────────────────────────────────── */

const searchWrap = { position: 'relative', maxWidth: 320, width: '100%' }

const searchIcon = {
  position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
  color: '#9CA3AF', pointerEvents: 'none',
}

const searchInput = {
  width: '100%',
  padding: '8px 11px 8px 33px',
  border: '1.5px solid #D5DAD0',
  borderRadius: 8,
  fontSize: '0.875rem',
  background: '#FFFFFF',
  color: '#111827',
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: 'border-color 100ms ease, box-shadow 100ms ease',
}

const tableScroll = {
  overflowX: 'auto',
  border: '1px solid #E3E8DF',
  borderRadius: 10,
  background: '#FFFFFF',
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#6B7280',
  background: '#F7FAF4',
  borderBottom: '1.5px solid #D5DAD0',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const tdStyle = {
  padding: '10px 14px',
  fontSize: '0.875rem',
  color: '#111827',
  borderBottom: '1px solid #E3E8DF',
  fontVariantNumeric: 'tabular-nums',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const emptyStyle = {
  padding: '3rem 1rem',
  textAlign: 'center',
  color: '#9CA3AF',
  fontSize: '0.875rem',
}

const paginationWrap = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
  padding: '2px 2px 0',
}

const paginationInfo = {
  fontSize: '0.81rem',
  color: '#9CA3AF',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const selectStyle = {
  padding: '6px 9px',
  border: '1.5px solid #D5DAD0',
  borderRadius: 7,
  fontSize: '0.79rem',
  background: '#FFFFFF',
  color: '#374151',
  fontFamily: "'Inter', system-ui, sans-serif",
  cursor: 'pointer',
}
