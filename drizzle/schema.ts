import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { InferModel } from "drizzle-orm";

export const positions = pgTable("positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: uuid("parent_id").references((): any => positions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type Position = InferModel<typeof positions>;