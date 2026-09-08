import React, { useState, useEffect, useMemo } from "react";
import Pagination from "./Pagination";

/**
 * usePagination Hook
 * 
 * Automatically handles pagination math, slicing data array, and renders the Pagination component in 1 line!
 * 
 * Usage:
 * const {
 *   currentItems,
 *   currentPage,
 *   setCurrentPage,
 *   totalPages,
 *   PaginationComponent
 * } = usePagination(myArrayData, { initialPageSize: 10 });
 * 
 * In JSX:
 * <table>{currentItems.map(...)}</table>
 * {PaginationComponent}
 */
export function usePagination(items = [], options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    showPageSize = true,
    showInfo = true,
    pageSizeOptions = [10, 20, 50, 100],
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to valid page if items or page size change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Sliced data for current page
  const currentItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Ready-to-use Pagination JSX Component
  const PaginationComponent = useMemo(() => {
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showPageSize={showPageSize}
        showInfo={showInfo}
        pageSizeOptions={pageSizeOptions}
      />
    );
  }, [currentPage, totalPages, totalItems, pageSize, showPageSize, showInfo, pageSizeOptions]);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    currentItems,
    PaginationComponent,
  };
}

export default usePagination;

