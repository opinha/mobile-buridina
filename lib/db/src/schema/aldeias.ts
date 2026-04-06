import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const aldeias = pgTable("aldeias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  localizacao: text("localizacao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAldeiaSchema = createInsertSchema(aldeias).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAldeia = z.infer<typeof insertAldeiaSchema>;
export type Aldeia = typeof aldeias.$inferSelect;
