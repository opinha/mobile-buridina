import { drizzle } from "drizzle-orm/node-postgres";
import { newDb, DataType } from "pg-mem";
import crypto from "crypto";
import * as schema from "./schema/index.js";

export * from "./schema/index.js";

console.log("Using PG-MEM local in-memory database fallback with Drizzle getTypeParser query interceptor...");

const memDb = newDb();

// Register gen_random_uuid
memDb.public.registerFunction({
  name: 'gen_random_uuid',
  args: [],
  returns: DataType.uuid,
  implementation: () => crypto.randomUUID(),
});

// Run DDL to create tables
memDb.public.none(`
CREATE TABLE "aldeias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"localizacao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "membros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aldeia_id" uuid NOT NULL,
	"nome_etnico" text NOT NULL,
	"nome_social" text NOT NULL,
	"endereco" text,
	"foto_url" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text NOT NULL,
	"nome" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_username_unique" UNIQUE("username")
);
CREATE TABLE "votos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membro_id" uuid NOT NULL,
	"avaliador_nome" text NOT NULL,
	"voto" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "votos" ADD CONSTRAINT "votos_membro_id_membros_id_fk" FOREIGN KEY ("membro_id") REFERENCES "membros"("id") ON DELETE cascade ON UPDATE no action;
`);

const pgMem = memDb.adapters.createPg();

// Patch Client.prototype.query to intercept Drizzle query calls
// pg-mem throws an error if query.types.getTypeParser is defined.
// We remove it from the query object before passing it to pg-mem's Client query method.
// We also emulate rowMode: 'array' because pg-mem does not support pg rowMode.
const originalQuery = pgMem.Client.prototype.query;
pgMem.Client.prototype.query = function(queryObj: any, ...args: any[]) {
  let emulateArray = false;
  if (queryObj && typeof queryObj === 'object') {
    if (queryObj.rowMode === 'array') {
      emulateArray = true;
      try {
        delete queryObj.rowMode;
      } catch (e) {
        queryObj = { ...queryObj };
        delete queryObj.rowMode;
      }
    }

    if (queryObj.types && queryObj.types.getTypeParser) {
      try {
        // Try deleting it directly
        delete queryObj.types.getTypeParser;
      } catch (e) {
        // If queryObj.types is read-only, replace the types object
        try {
          queryObj.types = { ...queryObj.types };
          delete queryObj.types.getTypeParser;
        } catch (innerErr) {
          // If queryObj itself is read-only, clone queryObj
          queryObj = { ...queryObj, types: { ...queryObj.types } };
          delete queryObj.types.getTypeParser;
        }
      }
    }
  }

  // Helper to map object rows to arrays if emulateArray is true
  const mapResult = (result: any) => {
    if (emulateArray && result && Array.isArray(result.rows) && result.rows.length > 0) {
      const fields = result.fields || [];
      let fieldNames = fields.map((f: any) => f.name);
      if (fieldNames.length === 0) {
        const firstRow = result.rows[0];
        if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
          fieldNames = Object.keys(firstRow);
        }
      }
      if (fieldNames.length > 0) {
        result.rows = result.rows.map((row: any) => {
          if (Array.isArray(row)) return row;
          return fieldNames.map((name: string) => row[name]);
        });
      }
    }
    return result;
  };

  // Intercept callback if present
  let callbackIdx = -1;
  for (let i = 0; i < args.length; i++) {
    if (typeof args[i] === 'function') {
      callbackIdx = i;
      break;
    }
  }

  if (callbackIdx !== -1) {
    const originalCallback = args[callbackIdx];
    args[callbackIdx] = function(err: any, result: any) {
      if (err) {
        return originalCallback(err);
      }
      return originalCallback(null, mapResult(result));
    };
    return originalQuery.apply(this, [queryObj, ...args]);
  }

  const resultPromise = originalQuery.apply(this, [queryObj, ...args]);
  if (resultPromise && typeof resultPromise.then === 'function') {
    return resultPromise.then((result: any) => mapResult(result));
  }
  return resultPromise;
};

export const pool = new pgMem.Pool();
export const db = drizzle(pool, { schema });
