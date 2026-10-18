'use client';

import React, { ReactNode, useState, useMemo } from 'react';
import { Search, Inbox, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  headerActions?: ReactNode;
  rowKey: (item: T) => string | number;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found',
  emptyAction,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  headerActions,
  rowKey,
}: DataTableProps<T>) {
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleHeaderClick = (idx: number, col: Column<T>) => {
    const isSortable = col.sortable ?? (Boolean(col.accessorKey) || Boolean(col.sortFn));
    if (!isSortable) return;

    if (sortIndex === idx) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortIndex(null);
      }
    } else {
      setSortIndex(idx);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (sortIndex === null || !sortDirection) return data;
    const col = columns[sortIndex];
    if (!col) return data;

    return [...data].sort((a, b) => {
      if (col.sortFn) {
        const res = col.sortFn(a, b);
        return sortDirection === 'asc' ? res : -res;
      }

      if (!col.accessorKey) return 0;

      const aVal = a[col.accessorKey];
      const bVal = b[col.accessorKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Numeric comparison
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      if (!isNaN(aNum) && !isNaN(bNum) && typeof aVal !== 'boolean' && typeof bVal !== 'boolean') {
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, columns, sortIndex, sortDirection]);

  return (
    <div className="card-theme overflow-hidden shadow-xs flex flex-col">
      {/* Header toolbar */}
      {(onSearchChange || headerActions) && (
        <div className="p-4 border-b border-theme flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onSearchChange ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-muted-theme absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="input-theme input-with-icon w-full !pl-10 text-sm"
              />
            </div>
          ) : (
            <div />
          )}

          {headerActions && (
            <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
          )}
        </div>
      )}

      {/* Table Body */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-theme bg-surface-hover/60">
              {columns.map((col, idx) => {
                const alignClass =
                  col.align === 'right'
                    ? 'text-right justify-end'
                    : col.align === 'center'
                    ? 'text-center justify-center'
                    : 'text-left justify-start';

                const isSortable = col.sortable ?? (Boolean(col.accessorKey) || Boolean(col.sortFn));
                const isSorted = sortIndex === idx;

                return (
                  <th
                    key={idx}
                    onClick={() => handleHeaderClick(idx, col)}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-theme select-none ${
                      isSortable ? 'cursor-pointer hover:text-theme hover:bg-surface-hover/80 transition-colors' : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${alignClass}`}>
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="shrink-0">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-amber-500" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-30 hover:opacity-75 transition-opacity" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme">
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <div className="h-4 bg-surface-hover rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center text-muted-theme mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-theme mb-1">{emptyMessage}</p>
                    <p className="text-xs text-muted-theme mb-4">
                      No matching records found.
                    </p>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={rowKey(item)}
                  className="hover:bg-surface-hover/60 transition-colors group"
                >
                  {columns.map((col, cIdx) => {
                    const alignClass =
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left';

                    const content = col.cell
                      ? col.cell(item)
                      : col.accessorKey
                      ? String(item[col.accessorKey] ?? '')
                      : null;

                    return (
                      <td
                        key={cIdx}
                        className={`px-4 py-3.5 text-theme ${alignClass} ${col.className || ''}`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
