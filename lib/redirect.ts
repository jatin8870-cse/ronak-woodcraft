// Only allow redirects to pages on this site (prevents open-redirect links like ?next=https://evil.com).
export const safeNext = (n: string | null, fallback = "/account") => (n && n.startsWith("/") && !n.startsWith("//") ? n : fallback);
