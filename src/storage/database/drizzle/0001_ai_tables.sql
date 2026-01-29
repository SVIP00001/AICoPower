-- 创建AI相关表

CREATE TABLE IF NOT EXISTS "ai_profiles" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) DEFAULT 'general' NOT NULL,
	"description" text,
	"avatar" text,
	"tags" jsonb,
	"level" varchar(20) DEFAULT 'beginner' NOT NULL,
	"certified_at" timestamp with time zone,
	"test_score" integer DEFAULT 0 NOT NULL,
	"test_precision" integer DEFAULT 0 NOT NULL,
	"test_adaptability" integer DEFAULT 0 NOT NULL,
	"test_efficiency" integer DEFAULT 0 NOT NULL,
	"test_compliance" integer DEFAULT 0 NOT NULL,
	"test_retake_count" integer DEFAULT 0 NOT NULL,
	"last_test_at" timestamp with time zone,
	"next_test_at" timestamp with time zone,
	"recommendation_score" integer DEFAULT 0 NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"consensus_passed" integer DEFAULT 0 NOT NULL,
	"consensus_total" integer DEFAULT 0 NOT NULL,
	"contribution_score" integer DEFAULT 0 NOT NULL,
	"total_revenue" integer DEFAULT 0 NOT NULL,
	"pricing_model" varchar(20),
	"pricing_rate" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"violation_count" integer DEFAULT 0 NOT NULL,
	"last_violation_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "ai_profiles_user_id_idx" ON "ai_profiles" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "ai_profiles_type_idx" ON "ai_profiles" USING btree ("type");
CREATE INDEX IF NOT EXISTS "ai_profiles_status_idx" ON "ai_profiles" USING btree ("status");
CREATE INDEX IF NOT EXISTS "ai_profiles_level_idx" ON "ai_profiles" USING btree ("level");
CREATE INDEX IF NOT EXISTS "ai_profiles_recommendation_score_idx" ON "ai_profiles" USING btree ("recommendation_score");

CREATE TABLE IF NOT EXISTS "ai_merchant_credentials" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_profile_id" varchar(36) NOT NULL,
	"company_name" varchar(100) NOT NULL,
	"business_license" text NOT NULL,
	"ai_compliance_report" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(36),
	"reviewed_at" timestamp with time zone,
	"review_comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "ai_merchant_credentials_ai_profile_id_unique" UNIQUE("ai_profile_id")
);

CREATE INDEX IF NOT EXISTS "ai_merchant_credentials_ai_profile_id_idx" ON "ai_merchant_credentials" USING btree ("ai_profile_id");
CREATE INDEX IF NOT EXISTS "ai_merchant_credentials_status_idx" ON "ai_merchant_credentials" USING btree ("status");

CREATE TABLE IF NOT EXISTS "ai_test_questions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"ai_type" varchar(20) NOT NULL,
	"level" varchar(20),
	"question" text NOT NULL,
	"options" jsonb,
	"correct_answer" text NOT NULL,
	"explanation" text,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "ai_test_questions_type_idx" ON "ai_test_questions" USING btree ("type");
CREATE INDEX IF NOT EXISTS "ai_test_questions_ai_type_idx" ON "ai_test_questions" USING btree ("ai_type");
CREATE INDEX IF NOT EXISTS "ai_test_questions_level_idx" ON "ai_test_questions" USING btree ("level");
CREATE INDEX IF NOT EXISTS "ai_test_questions_status_idx" ON "ai_test_questions" USING btree ("status");

CREATE TABLE IF NOT EXISTS "ai_test_records" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ai_profile_id" varchar(36) NOT NULL,
	"test_type" varchar(20) NOT NULL,
	"questions" jsonb NOT NULL,
	"answers" jsonb NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"precision_score" integer DEFAULT 0 NOT NULL,
	"adaptability_score" integer DEFAULT 0 NOT NULL,
	"efficiency_score" integer DEFAULT 0 NOT NULL,
	"compliance_score" integer DEFAULT 0 NOT NULL,
	"scored_by" jsonb,
	"passed" boolean DEFAULT false NOT NULL,
	"level" varchar(20),
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "ai_test_records_ai_profile_id_idx" ON "ai_test_records" USING btree ("ai_profile_id");

CREATE TABLE IF NOT EXISTS "ai_collaboration_tasks" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"requirements" jsonb,
	"team_size" integer DEFAULT 1 NOT NULL,
	"ai_ids" jsonb NOT NULL,
	"leader_id" varchar(36),
	"messages" jsonb,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"consensus_solution" text,
	"user_rating" integer,
	"user_feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "ai_collaboration_tasks_user_id_idx" ON "ai_collaboration_tasks" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "ai_collaboration_tasks_status_idx" ON "ai_collaboration_tasks" USING btree ("status");
