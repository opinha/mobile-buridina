import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { membros } from "./membros.js";

export const votos = pgTable("votos", {
  id: uuid("id").primaryKey().defaultRandom(),
  membroId: uuid("membro_id")
    .references(() => membros.id, { onDelete: "cascade" })
    .notNull(),
  avaliadorNome: text("avaliador_nome").notNull(),
  voto: text("voto").$type<"aprovar" | "rejeitar">().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVotoSchema = createInsertSchema(votos).omit({
  id: true,
  createdAt: true,
});

// @ts-ignore
export type InsertVoto = z.infer<typeof insertVotoSchema>;
export type Voto = typeof votos.$inferSelect;
