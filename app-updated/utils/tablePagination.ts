export const TABLE_PAGE_SIZE = 12;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

export function buildPaginationMeta(
  total: number,
  page: number,
  limit = TABLE_PAGE_SIZE
): PaginationMeta {
  const totalPages = total === 0 ? 1 : Math.ceil(total / limit);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = Math.min(safePage * limit, total);

  return {
    page: safePage,
    limit,
    total,
    totalPages,
    from,
    to,
  };
}

export function paginateItems<T>(
  items: T[],
  page: number,
  limit = TABLE_PAGE_SIZE
): { items: T[]; meta: PaginationMeta } {
  const meta = buildPaginationMeta(items.length, page, limit);
  const start = (meta.page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    meta,
  };
}

export function getPaginationButtons(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, currentPage, totalPages]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage > 2) pages.add(currentPage - 2);

  return [...pages].sort((a, b) => a - b);
}
