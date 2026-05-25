import React, { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

export default function DataTable({ data, columns }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        <input
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Buscar..."
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.25rem',
            width: '100%',
            maxWidth: '300px'
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} style={{ borderBottom: '2px solid #e5e7eb' }}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      padding: '0.75rem',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: header.column.getCanSort() ? 'none' : 'auto'
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: ' 🔼',
                      desc: ' 🔽',
                    }[header.column.getIsSorted()] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '0.75rem' }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                  No hay datos disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#374151' }}>
          Mostrando {startRow}-{endRow} de {totalRows} registros
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <select
            value={pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
            style={{ padding: '0.25rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
          >
            {[10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Mostrar {pageSize}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              style={{ padding: '0.25rem 0.5rem', cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff' }}
            >
              {'<<'} Primera
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{ padding: '0.25rem 0.5rem', cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff' }}
            >
              {'<'} Anterior
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{ padding: '0.25rem 0.5rem', cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff' }}
            >
              Siguiente {'>'}
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              style={{ padding: '0.25rem 0.5rem', cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff' }}
            >
              Última {'>>'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}