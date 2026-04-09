interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PaginationItem = number | "ellipsis";

function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<PaginationControlsProps>) {
  if (totalPages <= 1) {
    return null;
  }

  const items = buildPaginationItems(currentPage, totalPages);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-10 min-w-10 items-center justify-center px-1 text-sm font-extrabold text-slate-400"
          >
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={currentPage === item ? "page" : undefined}
            className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-extrabold transition-all ${
              currentPage === item
                ? "bg-[#42646D] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {item}
          </button>
        )
      )}
    </div>
  );
}
