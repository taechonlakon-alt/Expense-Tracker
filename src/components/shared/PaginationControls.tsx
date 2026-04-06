interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<PaginationControlsProps>) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, index) => {
        const pageNumber = index + 1;

        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={currentPage === pageNumber ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-extrabold transition-all ${
              currentPage === pageNumber
                ? "bg-[#42646D] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}
    </div>
  );
}
