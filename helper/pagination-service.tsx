import React from "react";
import _ from "lodash";

// Utility function to calculate pager properties
const getPager = (totalItems: number, currentPage = 1, pageSize = 20) => {
  // calculate total pages
  let totalPages = Math.ceil(totalItems / pageSize);
  let startPage: number, endPage;

  if (totalPages <= 10) {
    // less than 10 total pages so show all
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= 6) {
      startPage = 1;
      endPage = 10;
    } else if (currentPage + 4 >= totalPages) {
      startPage = totalPages - 9;
      endPage = totalPages;
    } else {
      startPage = currentPage - 5;
      endPage = currentPage + 4;
    }
  }

  // calculate start and end item indexes
  let startIndex = (currentPage - 1) * pageSize;
  let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

  // create an array of pages to use in the pager control
  let pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  // return object with all pager properties required by the view
  return {
    totalItems,
    currentPage,
    pageSize,
    totalPages,
    startPage,
    endPage,
    startIndex,
    endIndex,
    pages,
  };
};

const PaginationService = {
  getPager,
  getPagerCompanies: (totalItems: number, currentPage = 1, pageSize = 20) =>
    getPager(totalItems, currentPage, pageSize),
};

export default PaginationService;
