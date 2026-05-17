export const queryKeys = {
  persons: ["persons"] as const,
  personDetail: (id: string) => ["persons", id] as const,
  personPrivate: (id: string) => ["person-private", id] as const,
  personRelationships: (id: string) => ["person-relationships", id] as const,
  relationships: ["relationships"] as const,
  customEvents: ["custom-events"] as const,
  session: ["session"] as const,
  profile: (userId: string) => ["profile", userId] as const,
};
