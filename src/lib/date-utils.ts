
export function formatLastSeen(lastSeen: string | null | undefined): string {
  if (!lastSeen) return "Offline";

  const date = new Date(lastSeen);
  if (isNaN(date.getTime())) {

    return lastSeen.toLowerCase().startsWith("last seen") ? lastSeen : `Last seen ${lastSeen}`;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return "Last seen just now";
  }

  if (diffInSeconds < 60) {
    return "Last seen just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Last seen ${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Last seen ${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Last seen ${diffInDays}d ago`;
  }

  // Format as short date if older than a week
  return `Last seen ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })}`;
}
