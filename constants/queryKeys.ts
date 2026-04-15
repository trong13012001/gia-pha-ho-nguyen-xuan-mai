export const queryKeys = {
  persons: ["persons"] as const,
  personDetail: (id: string) => ["persons", id] as const,
  personPrivateDetail: (id: string) => ["persons", id, "private"] as const,
  personSelector: ["persons", "selector"] as const,
  relationships: ["relationships"] as const,
  customEvents: ["custom-events"] as const,
  users: ["users"] as const,
};

// Backward-compatible alias while old imports are migrated.
export const QUERY_KEY = queryKeys;
