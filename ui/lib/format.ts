export function formatBytes(bytes: number | null) {
  if (bytes == null) return "—";
  if (bytes === 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Short "2h ago" style label, falling back to a date for older values. */
export function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) {
    return "Just now";
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

/** Groups conversation timestamps into Today / Yesterday / Previous buckets. */
export function relativeDayGroup(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Earlier";
  }
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays <= 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return "Previous 7 days";
  }
  if (diffDays < 30) {
    return "Previous 30 days";
  }
  return "Earlier";
}
