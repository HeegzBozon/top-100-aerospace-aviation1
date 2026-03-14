import React from 'react';
import { ArrowUp, ArrowDown, ChevronsUpDown, Loader2 } from 'lucide-react';

const getResponsiveClasses = (breakpoint) => {
  const classes = {
    sm: 'hidden sm:table-cell',
    md: 'hidden md:table-cell',
    lg: 'hidden lg:table-cell',
    xl: 'hidden xl:table-cell',
    '2xl': 'hidden 2xl:table-cell'
  };
  return classes[breakpoint] || '';
};

const getFrozenClasses = (isFrozen) => {
  if (!isFrozen) return '';
  return 'sticky bg-[var(--card)] backdrop-blur-xl shadow-lg';
};

const getFrozenPosition = (columnIndex, columnConfig) => {
  let left = 0;
  for (let i = 0; i < columnIndex; i++) {
    if (columnConfig[i].is_frozen) {
      const widthClass = columnConfig[i].min_width;
      const widthValue = parseInt(widthClass.replace('w-', '')) * 4; // tailwind w- unit is 0.25rem
      left += widthValue;
    }
  }
  return left;
};

const SortableHeader = ({ children, sortKey, onSort, sortConfig, className = '', style = {} }) => {
  const isSorted = sortConfig.key === sortKey;
  const SortIcon = isSorted
    ? (sortConfig.direction === 'asc' ? ArrowUp : ArrowDown)
    : ChevronsUpDown;

  return (
    <th
      className={`p-3 text-xs font-semibold uppercase cursor-pointer hover:bg-white/10 transition-colors ${className}`}
      onClick={() => onSort(sortKey)}
      style={style}
    >
      <div className="flex items-center justify-center gap-1">
        {children}
        <SortIcon className={`w-3 h-3 ${isSorted ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
      </div>
    </th>
  );
};

export default function StandingsTable({ rows, sortConfig, onSort, onRowClick, containerRef, onScroll, isFetchingMore, hasMore }) {
  const [columnConfig, setColumnConfig] = React.useState([]);

  React.useEffect(() => {
    // This will be replaced by fetching from StandingsColumnConfig entity
    const defaultConfig = [
        { column_key: 'rank', display_name: 'Rank', order_index: 0, is_visible: true, is_sortable: true, is_frozen: true, min_width: 'w-16', responsive_breakpoint: 'always' },
        { column_key: 'nomineeName', display_name: 'Nominee', order_index: 1, is_visible: true, is_sortable: false, is_frozen: true, min_width: 'w-64', responsive_breakpoint: 'always' },
        { column_key: 'aura', display_name: 'Aura', order_index: 2, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-24', responsive_breakpoint: 'always' },
        { column_key: 'delta24h', display_name: 'Δ24H', order_index: 3, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'always' },
        { column_key: 'total_wins', display_name: 'Wins', order_index: 4, is_visible: true, is_sortable: true, is_frozen: false, min_width: 'w-20', responsive_breakpoint: 'md' },
    ];
    setColumnConfig(defaultConfig.filter(c => c.is_visible).sort((a, b) => a.order_index - b.order_index));
  }, []);

  return (
    <div className="bg-[var(--glass)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div ref={containerRef} onScroll={onScroll} className="overflow-x-auto max-h-[70vh]">
        <table className="w-full table-fixed min-w-[1200px]">
          <thead className="sticky top-0 z-20">
            <tr>
              {columnConfig.map((column, columnIndex) => {
                const responsiveClasses = getResponsiveClasses(column.responsive_breakpoint);
                const headerAlignment = column.column_key === 'nomineeName' ? 'text-left' : 'text-center';
                const frozenClasses = column.is_frozen ? getFrozenClasses(true) : '';
                const leftPosition = column.is_frozen ? getFrozenPosition(columnIndex, columnConfig) : 0;
                
                if (column.is_sortable) {
                  return (
                    <SortableHeader
                      key={column.column_key}
                      sortKey={column.column_key}
                      onSort={onSort}
                      sortConfig={sortConfig}
                      className={`${headerAlignment} ${column.min_width} ${responsiveClasses} ${frozenClasses} ${column.is_frozen ? 'z-30' : 'z-20'} sticky top-0 bg-[var(--card)] backdrop-blur-xl border-b border-[var(--border)]`}
                      style={column.is_frozen ? { left: `${leftPosition}px` } : {}}
                    >
                      {column.display_name}
                    </SortableHeader>
                  );
                } else {
                  return (
                    <th
                      key={column.column_key}
                      className={`p-3 ${headerAlignment} text-xs font-semibold uppercase text-[var(--text)] ${column.min_width} ${responsiveClasses} ${frozenClasses} ${column.is_frozen ? 'z-30' : 'z-20'} sticky top-0 bg-[var(--card)] backdrop-blur-xl border-b border-[var(--border)]`}
                      style={column.is_frozen ? { left: `${leftPosition}px` } : {}}
                    >
                      {column.display_name}
                    </th>
                  );
                }
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((row, rowIndex) => (
              <tr 
                key={row.nomineeId} 
                className="hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => onRowClick(row)}
              >
                {columnConfig.map((column, colIndex) => {
                    const responsiveClasses = getResponsiveClasses(column.responsive_breakpoint);
                    const cellAlignment = column.column_key === 'nomineeName' ? 'text-left' : 'text-center';
                    const frozenClasses = column.is_frozen ? getFrozenClasses(true) : '';
                    const leftPosition = column.is_frozen ? getFrozenPosition(colIndex, columnConfig) : 0;
                    
                    let content;
                    switch (column.column_key) {
                        case 'rank':
                            content = <span className="font-bold text-lg">#{row.rank}</span>;
                            break;
                        case 'nomineeName':
                            content = (
                                <div className="flex items-center gap-3">
                                    <img src={row.avatarUrl || `https://i.pravatar.cc/40?u=${row.nomineeId}`} alt={row.nomineeName} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-medium truncate">{row.nomineeName}</span>
                                </div>
                            );
                            break;
                        case 'delta24h':
                            content = (
                                <div className={`flex items-center justify-center gap-1 font-semibold ${row.delta24h > 0 ? 'text-green-400' : row.delta24h < 0 ? 'text-red-400' : 'text-[var(--muted)]'}`}>
                                    {row.delta24h > 0 ? <ArrowUp size={14} /> : row.delta24h < 0 ? <ArrowDown size={14} /> : '-'}
                                    {Math.abs(row.delta24h) > 0 && Math.abs(row.delta24h)}
                                </div>
                            );
                            break;
                        default:
                            content = row[column.column_key] || '-';
                    }

                    return (
                        <td 
                            key={column.column_key} 
                            className={`p-3 ${cellAlignment} ${column.min_width} ${responsiveClasses} ${frozenClasses}`}
                            style={column.is_frozen ? { left: `${leftPosition}px` } : {}}
                        >
                            {content}
                        </td>
                    );
                })}
              </tr>
            ))}
            {isFetchingMore && (
              <tr>
                <td colSpan={columnConfig.length} className="p-4 text-center">
                  <div className="flex justify-center items-center gap-2 text-[var(--muted)]">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                </td>
              </tr>
            )}
            {!hasMore && rows.length > 0 && (
                 <tr>
                    <td colSpan={columnConfig.length} className="p-4 text-center text-[var(--muted)]">
                        You've reached the end of the list.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}