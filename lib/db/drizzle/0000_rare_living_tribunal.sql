CREATE TABLE "aldeias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"localizacao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "votos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membro_id" uuid NOT NULL,
	"avaliador_nome" text NOT NULL,
	"voto" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "votos" ADD CONSTRAINT "votos_membro_id_membros_id_fk" FOREIGN KEY ("membro_id") REFERENCES "public"."membros"("id") ON DELETE cascade ON UPDATE no action;