export const param = (p: string | string[] | undefined): string =>
  Array.isArray(p) ? p[0] ?? '' : (p ?? '');

export const queryNum = (q: unknown, def: number): number => {
  const v = Array.isArray(q) ? q[0] : q;
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
};

export const queryStr = (q: unknown, def: string): string => {
  const v = Array.isArray(q) ? q[0] : q;
  return typeof v === 'string' ? v : def;
};
