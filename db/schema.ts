import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  email: text("email").notNull(),
  defaultHoursPerDay: integer("default_hours_per_day"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id")
    .notNull()
    .references(() => users.clerkUserId, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const targetJobs = pgTable("target_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id")
    .notNull()
    .references(() => users.clerkUserId, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  sourceUrl: text("source_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GapReport = {
  matched_skills: { skill: string; evidence: string }[];
  missing_skills: {
    skill: string;
    importance: "must-have" | "nice-to-have";
    reason: string;
  }[];
  strengths: string[];
  gaps: string[];
};

export type RoadmapItem = {
  title: string;
  description: string;
  type: "learn" | "build" | "practice";
  est_hours: number;
  priority: number;
};

export type Roadmap = {
  summary: string;
  items: RoadmapItem[];
  est_total_hours: number;
  est_days_at_pace: number;
};

export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id")
    .notNull()
    .references(() => users.clerkUserId, { onDelete: "cascade" }),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  targetJobId: uuid("target_job_id")
    .notNull()
    .references(() => targetJobs.id, { onDelete: "cascade" }),
  hoursPerDay: integer("hours_per_day").notNull(),
  title: text("title"),
  gapReport: jsonb("gap_report").$type<GapReport>(),
  roadmap: jsonb("roadmap").$type<Roadmap>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
