/**
 * Space routes and labels for navigation (planets + taskbar).
 * Keep in sync with actual routes under /space/*.
 */
export const SPACE_ROUTES = [
  { slug: "connect", label: "Connect", path: "/space/connect" },
  { slug: "pro", label: "Pro", path: "/space/pro" },
  { slug: "events", label: "Events", path: "/space/events" },
  { slug: "dm", label: "DM", path: "/space/dm" },
  { slug: "my-posts", label: "My Posts", path: "/space/my-posts" },
] as const;

export const SPACE_HOME_PATH = "/space";
