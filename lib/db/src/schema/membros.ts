import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membros = pgTable("membros", {
  id: uuid("id").primaryKey().defaultRandom(),
  aldeiaId: uuid("aldeia_id").notNull(),
  nomeEtnico: text("nome_etnico").notNull(),
  nomeSocial: text("nome_social").notNull(),
  endereco: text("endereco"),
  fotoUrl: text("foto_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMembroSchema = createInsertSchema(membros).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMembro = z.infer<typeof insertMembroSchema>;
export type Membro = typeof membros.$inferSelect;
