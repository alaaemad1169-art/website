-- =============================================================================
-- AgriCore Supabase Migration: 01_extensions.sql
-- Description: Enables required PostgreSQL extensions for UUID generation,
--              trigram full-text search, unaccenting, and cryptographic hashing.
-- Target Database: PostgreSQL 15+ / Supabase
-- =============================================================================

-- Enable UUID generation functions (e.g., gen_random_uuid(), uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Enable trigram matching for fuzzy search on Arabic/English names, titles, and skills
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;

-- Enable unaccent for accent-insensitive search queries
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA extensions;

-- Enable pgcrypto for cryptographic utility functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- (Optional future readiness) Enable pgvector for semantic AI candidate matching
-- Note: Requires pgvector extension in Supabase Database Extensions
-- CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA extensions;

COMMENT ON EXTENSION "uuid-ossp" IS 'AgriCore: Secure UUID generation for primary and foreign keys';
COMMENT ON EXTENSION "pg_trgm" IS 'AgriCore: Trigram indexing for high-speed candidate and job search';
