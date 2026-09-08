import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import "./Pagination.css";

/**
 * Global Reusable Pagination Component
 * 
 * Props:
 * - currentPage: number (current active page, 1-indexed)
 * - totalPages: number (total number of pages)
 * - totalItems: number (optional: total count of records)
 * - pageSize: number (optional: current records per page)
 * - onPageChange: (page: number) => void
 * - onPageSizeChange: (pageSize: number) => void (optional)
 * - pageSizeOptions: number[] (default: [10, 20, 50, 100])
 * - showInfo: boolean (default: true if totalItems provided)
 * - showPageSize: boolean (default: false)
 * - maxVisiblePages: number (default: 5)
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  pageSize = 10,
  onPageChange = () => {},
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showInfo = true,
  showPageSize = false,
  maxVisiblePages = 5,
  className = "",
}) {
  // If no pages or invalid, default to 1
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.min(Math.max(1, currentPage || 1), safeTotalPages);

  // Generate smart pagination numbers with ellipsis
  function getPageNumbers() {
    if (safeTotalPages <= maxVisiblePages) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(2, safeCurrentPage - half);
    let end = Math.min(safeTotalPages - 1, safeCurrentPage + half);

    if (safeCurrentPage <= half + 2) {
      end = maxVisiblePages;
      start = 2;
    } else if (safeCurrentPage >= safeTotalPages - half - 1) {
      start = safeTotalPages - maxVisiblePages + 1;
      end = safeTotalPages - 1;
    }

    // Always include page 1
    pages.push(1);

    if (start > 2) {
      pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < safeTotalPages) {
        pages.push(i);
      }
    }

    if (end < safeTotalPages - 1) {
      pages.push("ellipsis-end");
    }

    // Always include last page
    if (safeTotalPages > 1) {
      pages.push(safeTotalPages);
    }

    return pages;
  }

  const pageNumbers = getPageNumbers();

  // Info label calculations
  const startItem = totalItems !== undefined ? (safeCurrentPage - 1) * pageSize + 1 : null;
  const endItem = totalItems !== undefined ? Math.min(safeCurrentPage * pageSize, totalItems) : null;

  return (
    <div className={`app-pagination-container ${className}`}>
      {/* Left side: Results Count Info & Page Size */}
      <div className="app-pagination-left">
        {showInfo && totalItems !== undefined && totalItems > 0 && (
          <span className="app-pagination-info">
            Showing <strong className="app-pagination-highlight">{startItem}</strong> to{" "}
            <strong className="app-pagination-highlight">{endItem}</strong> of{" "}
            <strong className="app-pagination-highlight">{totalItems}</strong> entries
          </span>
        )}

        {showPageSize && onPageSizeChange && (
          <div className="app-pagination-pagesize-wrap">
            <label htmlFor="app-page-size-select">Show</label>
            <select
              id="app-page-size-select"
              className="app-pagination-pagesize-select"
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // Reset to page 1 on page size change
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
        )}
      </div>

      {/* Right side: Page Navigation Controls */}
      <div className="app-pagination-controls">
        {/* First Page Button */}
        <button
          type="button"
          className="app-pagination-btn nav-btn"
          title="First Page"
          disabled={safeCurrentPage === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          className="app-pagination-btn nav-btn"
          title="Previous Page"
          disabled={safeCurrentPage === 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Number Buttons & Ellipses */}
        <div className="app-pagination-numbers">
          {pageNumbers.map((p, idx) => {
            if (p === "ellipsis-start" || p === "ellipsis-end") {
              return (
                <span key={`ellipsis-${idx}`} className="app-pagination-ellipsis">
                  •••
                </span>
              );
            }

            const isActive = p === safeCurrentPage;

            return (
              <button
                key={`page-${p}`}
                type="button"
                className={`app-pagination-btn number-btn ${isActive ? "active" : ""}`}
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          className="app-pagination-btn nav-btn"
          title="Next Page"
          disabled={safeCurrentPage === safeTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
        >
          <ChevronRight size={15} />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          className="app-pagination-btn nav-btn"
          title="Last Page"
          disabled={safeCurrentPage === safeTotalPages}
          onClick={() => onPageChange(safeTotalPages)}
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
}

