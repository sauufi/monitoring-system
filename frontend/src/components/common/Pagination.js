// frontend/src/components/common/Pagination.js
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Pagination component for navigating through pages of data
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  maxVisiblePages = 5,
  onPageChange,
  showItemsInfo = true,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  className = '',
  ...props
}) => {
  // Calculate start and end item numbers
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
      // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate range to show based on current page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      // Adjust if end page exceeds total pages
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      // Always show first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Always show last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (e) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
    }
  };
  
  return (
    <div className={`d-flex flex-column flex-md-row justify-content-between align-items-center ${className}`} {...props}>
      {/* Items info */}
      {showItemsInfo && totalItems > 0 && (
        <div className="mb-3 mb-md-0 text-muted small">
          Showing {startItem} to {endItem} of {totalItems} items
        </div>
      )}
      
      <div className="d-flex align-items-center">
        {/* Page Size Selector */}
        {showPageSize && onPageSizeChange && (
          <div className="me-3 d-flex align-items-center">
            <label htmlFor="pageSize" className="me-2 text-nowrap small">Items per page:</label>
            <select
              id="pageSize"
              className="form-select form-select-sm"
              value={pageSize}
              onChange={handlePageSizeChange}
              style={{ width: 'auto' }}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination pagination-sm mb-0">
              {/* Previous Button */}
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous"
                >
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              
              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <li 
                  key={index} 
                  className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => page !== '...' && handlePageChange(page)}
                    disabled={page === '...'}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              {/* Next Button */}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next"
                >
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  totalItems: PropTypes.number,
  pageSize: PropTypes.number,
  maxVisiblePages: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  showItemsInfo: PropTypes.bool,
  showPageSize: PropTypes.bool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  onPageSizeChange: PropTypes.func,
  className: PropTypes.string
};

export default Pagination;