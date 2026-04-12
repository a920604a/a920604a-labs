import { useState, useMemo } from 'react';

export function usePagination(data, itemsPerPage = 10) {
  const [page, setPage] = useState(1);
  const maxPage = Math.ceil(data.length / itemsPerPage);

  const currentData = useMemo(() => {
    const begin = (page - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return data.slice(begin, end);
  }, [data, page, itemsPerPage]);

  const next = () => setPage((p) => Math.min(p + 1, maxPage));
  const prev = () => setPage((p) => Math.max(p - 1, 1));
  const jump = (p) => setPage(Math.min(Math.max(1, p), maxPage));

  return { currentData, page, maxPage, next, prev, jump, setPage };
}
