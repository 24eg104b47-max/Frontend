export const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];

export const statusLabel = (s) =>
  ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', COMPLETED: 'Completed' }[String(s)] || String(s).replace(/_/g, ' '));

/** Accepts legacy values from v1 backend rows too. */
export const normalizeStatus = (s) => {
  const n = String(s || 'TODO').toUpperCase().replace(/[ -]/g, '_');
  if (n === 'PENDING' || n === 'TO_DO') return 'TODO';
  if (n === 'INPROGRESS') return 'IN_PROGRESS';
  if (n === 'INREVIEW' || n === 'REVIEW') return 'IN_REVIEW';
  if (n === 'DONE' || n === 'COMPLETE') return 'COMPLETED';
  return STATUSES.includes(n) ? n : 'TODO';
};

export const statusBadge = (s) =>
  `badge status-${normalizeStatus(s).toLowerCase().replace(/_/g, '')}`;

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
export const priorityRank = (p) => PRIORITY_RANK[p] ?? 2;

export const isOverdue = (t) =>
  t.deadline && normalizeStatus(t.status) !== 'COMPLETED' &&
  new Date(t.deadline) < new Date(new Date().toDateString());

export const fmtDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString() : '—');
