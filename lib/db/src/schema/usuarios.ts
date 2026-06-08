import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  role: text("role").$type<"master" | "admin" | "avaliador">().notNull(),
  nome: text("nome").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUsuarioSchema = createInsertSchema(usuarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// @ts-ignore
export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuarios.$inferSelect;
