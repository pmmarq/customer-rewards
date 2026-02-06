import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";

function SortIndicator({ direction }) {
  if (!direction) {
    return <span className="text-slate-300 ml-1">&#8597;</span>;
  }
  return (
    <span className="ml-1">{direction === "asc" ? "\u25B2" : "\u25BC"}</span>
  );
}

function SortableTable({
  title,
  columns,
  data,
  rowKey,
  defaultSortKey,
  defaultSortDir,
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey || null);
  const [sortDir, setSortDir] = useState(defaultSortDir || "asc");

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      let cmp;
      if (typeof aVal === "string") {
        const aParts = aVal.split(" ");
        const bParts = bVal.split(" ");
        const aLast = aParts[aParts.length - 1];
        const bLast = bParts[bParts.length - 1];
        cmp = aLast.localeCompare(bLast) || aVal.localeCompare(bVal);
      } else {
        cmp = aVal - bVal;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2.5 font-semibold ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.sortable !== false ? "cursor-pointer select-none hover:text-slate-700 transition-colors" : ""}`}
                  onClick={
                    col.sortable !== false
                      ? () => handleSort(col.key)
                      : undefined
                  }
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {col.label}
                  {col.sortable !== false && (
                    <SortIndicator
                      direction={sortKey === col.key ? sortDir : null}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((row) => (
              <tr
                key={rowKey(row)}
                className="hover:bg-slate-50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 ${col.cellClass || "text-slate-700"}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

SortIndicator.propTypes = {
  direction: PropTypes.oneOf(["asc", "desc", null]),
};

SortableTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.string,
      cellClass: PropTypes.string,
      sortable: PropTypes.bool,
      render: PropTypes.func,
    }),
  ).isRequired,
  data: PropTypes.array.isRequired,
  rowKey: PropTypes.func.isRequired,
  defaultSortKey: PropTypes.string,
  defaultSortDir: PropTypes.oneOf(["asc", "desc"]),
};

export default React.memo(SortableTable);
