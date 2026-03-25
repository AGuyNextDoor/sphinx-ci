import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  labels: {
    prev: string;
    next: string;
    page: string;
    of: string;
  };
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  labels,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      {currentPage > 1 ? (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="text-sm px-3 py-1.5 rounded border transition-colors"
          style={{ borderColor: "#252036", color: "#b0a8c4" }}
        >
          {labels.prev}
        </Link>
      ) : (
        <span className="text-sm px-3 py-1.5 opacity-30" style={{ color: "#8b85a0" }}>
          {labels.prev}
        </span>
      )}

      <span className="text-xs" style={{ color: "#8b85a0" }}>
        {labels.page} {currentPage} {labels.of} {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="text-sm px-3 py-1.5 rounded border transition-colors"
          style={{ borderColor: "#252036", color: "#b0a8c4" }}
        >
          {labels.next}
        </Link>
      ) : (
        <span className="text-sm px-3 py-1.5 opacity-30" style={{ color: "#8b85a0" }}>
          {labels.next}
        </span>
      )}
    </div>
  );
}
