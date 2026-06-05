import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  jsonb,
  uuid,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// ─── NextAuth required tables ───────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ─── App tables ─────────────────────────────────────────────────────────────
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("projects_user_idx").on(t.userId)]
);

export const uploads = pgTable(
  "uploads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    r2Key: text("r2_key"),
    size: integer("size").notNull(),
    mimeType: text("mime_type"),
    status: text("status").notNull().default("pending"), // pending | processing | completed | failed
    logType: text("log_type"), // apache | nginx | syslog | auth | csv | generic
    totalLines: integer("total_lines"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("uploads_user_idx").on(t.userId)]
);

export const logs = pgTable(
  "logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    lineNumber: integer("line_number"),
    timestamp: timestamp("timestamp", { mode: "date" }),
    ip: text("ip"),
    method: text("method"),
    path: text("path"),
    statusCode: integer("status_code"),
    responseSize: integer("response_size"),
    userAgent: text("user_agent"),
    username: text("username"),
    raw: text("raw").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("logs_upload_idx").on(t.uploadId),
    index("logs_ip_idx").on(t.ip),
  ]
);

export const threats = pgTable(
  "threats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // brute_force | sql_injection | xss | traversal | credential_stuffing | suspicious_bot | privilege_escalation
    severity: text("severity").notNull(), // low | medium | high | critical
    title: text("title").notNull(),
    description: text("description").notNull(),
    evidence: jsonb("evidence"), // array of matching log lines
    affectedIps: text("affected_ips").array(),
    occurrences: integer("occurrences").default(1),
    aiAnalysis: text("ai_analysis"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("threats_upload_idx").on(t.uploadId),
    index("threats_user_idx").on(t.userId),
    index("threats_severity_idx").on(t.severity),
  ]
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    executiveSummary: text("executive_summary"),
    threatOverview: text("threat_overview"),
    affectedAssets: jsonb("affected_assets"),
    iocs: jsonb("iocs"), // indicators of compromise
    timeline: jsonb("timeline"),
    riskAssessment: text("risk_assessment"),
    recommendedActions: jsonb("recommended_actions"),
    conclusion: text("conclusion"),
    riskScore: integer("risk_score").default(50),
    fullContent: text("full_content"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("reports_user_idx").on(t.userId)]
);

export const chatHistory = pgTable(
  "chat_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id").notNull(),
    role: text("role").notNull(), // user | assistant
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("chat_user_idx").on(t.userId),
    index("chat_session_idx").on(t.sessionId),
  ]
);

export const securityScores = pgTable(
  "security_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uploadId: uuid("upload_id")
      .notNull()
      .references(() => uploads.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    score: integer("score").notNull(), // 0 = critical risk, 100 = secure
    criticalCount: integer("critical_count").default(0),
    highCount: integer("high_count").default(0),
    mediumCount: integer("medium_count").default(0),
    lowCount: integer("low_count").default(0),
    totalThreats: integer("total_threats").default(0),
    factors: jsonb("factors"), // breakdown of scoring factors
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("scores_user_idx").on(t.userId)]
);

// Type exports
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type Threat = typeof threats.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type ChatMessage = typeof chatHistory.$inferSelect;
export type SecurityScore = typeof securityScores.$inferSelect;

export type NewUpload = typeof uploads.$inferInsert;
export type NewLog = typeof logs.$inferInsert;
export type NewThreat = typeof threats.$inferInsert;
export type NewReport = typeof reports.$inferInsert;
export type NewChatMessage = typeof chatHistory.$inferInsert;
export type NewSecurityScore = typeof securityScores.$inferInsert;
