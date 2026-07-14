import { useState, useCallback } from 'react';
export function usePagination(initialPage = 1, initialLimit = 20) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / limit);
  const nextPage = useCallback(() => setPage(p => Math.min(p + 1, totalPages)), [totalPages]);
  const prevPage = useCallback(() => setPage(p => Math.max(p - 1, 1)), []);
  const goToPage = useCallback((p) => setPage(Math.max(1, Math.min(p, totalPages))), [totalPages]);
  return { page, limit, total, totalPages, setTotal, nextPage, prevPage, goToPage, setPage, setLimit };
}
