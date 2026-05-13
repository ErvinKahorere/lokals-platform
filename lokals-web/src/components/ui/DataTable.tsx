import type { ReactNode } from 'react'

type Column<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyState,
}: {
  columns: Column<T>[]
  rows: T[]
  emptyState?: ReactNode
}) {
  if (rows.length === 0) {
    return <>{emptyState ?? null}</>
  }

  return (
    <div className="overflow-x-auto rounded-[24px] border border-lokals-border bg-white shadow-card">
      <table className="min-w-full divide-y divide-lokals-border text-left">
        <thead className="bg-slate-50/90">
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-lokals-muted ${column.className ?? ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-lokals-border">
          {rows.map((row, index) => (
            <tr key={String(('id' in row ? row.id : undefined) ?? index)} className="align-top">
              {columns.map((column) => (
                <td key={String(column.key)} className={`px-4 py-4 text-sm text-lokals-charcoal ${column.className ?? ''}`}>
                  {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
