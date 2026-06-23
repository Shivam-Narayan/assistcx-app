"use client";

interface Pager {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  startIndex: number;
  endIndex: number;
  pages: number[];
}

interface Props {
  pager?: Pager;
  totalRecords: number;
  setPagination: (pageNumber: number) => void;
}

const PaginationComponent = ({ pager, totalRecords, setPagination }: Props) => {
  return (
    pager?.pages &&
    pager?.pages?.length &&
    totalRecords > 0 && (
      <ul className="inline-flex -space-x-px text-base h-10">
        <li>
          <button
            className={`flex items-center justify-center px-4 h-10 leading-tight text-muted-foreground bg-background border border-e-0 border-gray-300 rounded-s-lg ${
              pager?.currentPage === 1
                ? "text-muted-foreground cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            }`}
            onClick={() => setPagination(1)}
            disabled={pager?.currentPage === 1}
          >
            First
          </button>
        </li>
        <li>
          <button
            className={`flex items-center justify-center px-4 h-10 leading-tight text-muted-foreground bg-background border border-gray-300 ${
              pager?.currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            }`}
            onClick={() => setPagination(pager.currentPage - 1)}
            disabled={pager?.currentPage === 1}
          >
            Previous
          </button>
        </li>
        {pager?.pages.map((pageNo: number) => (
          <li key={pageNo}>
            <button
              className={`flex cursor-pointer items-center justify-center px-4 h-10 leading-tight text-gray-500  border border-gray-300 ${
                pager?.currentPage === pageNo
                  ? `text-white bg-black border-gray-300 hover:bg-black hover:text-white bg-primary hover:bg-primary `
                  : "hover:bg-gray-100 hover:text-gray-700"
              }`}
              onClick={() => setPagination(pageNo)}
            >
              {pageNo}
            </button>
          </li>
        ))}
        <li>
          <button
            className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-background border border-gray-300 ${
              pager?.currentPage === pager?.totalPages - 0
                ? "text-gray-300 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            }`}
            onClick={() => setPagination(pager?.currentPage + 1)}
            disabled={pager?.currentPage === pager?.totalPages - 0}
          >
            Next
          </button>
        </li>
        <li>
          <button
            className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-background border border-gray-300 rounded-e-lg ${
              pager?.currentPage === pager?.totalPages - 0
                ? "text-gray-300 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-100 hover:text-gray-700"
            }`}
            onClick={() => setPagination(pager?.totalPages - 0)}
            disabled={pager?.currentPage === pager?.totalPages - 0}
          >
            Last
          </button>
        </li>
      </ul>
    )
  );
};

export default PaginationComponent;
