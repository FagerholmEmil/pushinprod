CREATE TABLE IF NOT EXISTS "repos" (
	"id" serial PRIMARY KEY NOT NULL,
	"knowledge_tree" jsonb DEFAULT '{}',
	"github_user" text NOT NULL,
	"github_repo" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
