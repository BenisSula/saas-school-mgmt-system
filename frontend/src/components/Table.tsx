import React from 'react';

export interface TableColumn<T> {
  key?: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
}

export function Table<T>({ columns, data, emptyMessage = 'No records found.' }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-800 shadow-sm">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((column) => (
              <th key={column.key.toString()} className="px-4 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-slate-900/80">
              {columns.map((column, columnIndex) => (
                <td key={column.key ? String(column.key) : `${index}-${columnIndex}`} className="px-4 py-3">
                  {column.render
                    ? column.render(row)
                    : column.key
                      ? String(row[column.key] ?? '')
                      : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

