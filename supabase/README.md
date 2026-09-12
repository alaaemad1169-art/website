# AgriCore Supabase Database Migrations

This folder contains the complete, battle-tested PostgreSQL 15+ database architecture for **AgriCore**—the agricultural talent and recruitment platform.

## Deployment Sequence

Apply these scripts in the exact numerical order listed below to respect foreign keys, extensions, and trigger dependencies:

| Step | Migration Script | Description |
|---|---|---|
| **01** | [`01_extensions.sql`](./migrations/01_extensions.sql) | Enables `uuid-ossp`, `pg_trgm`, `unaccent`, and `pgcrypto`. |
| **02** | [`02_enums.sql`](./migrations/02_enums.sql) | Defines enumerations for roles, education tiers, employment types, and application statuses. |
| **03** | [`03_tables.sql`](./migrations/03_tables.sql) | Creates all core tables: profiles, companies, specializations, skills, jobs, applications, messaging, and child entities. |
| **04** | [`04_indexes.sql`](./migrations/04_indexes.sql) | Builds high-speed B-Tree indexes on foreign keys and GIN Trigram indexes for Arabic/English search. |
| **05** | [`05_functions_triggers.sql`](./migrations/05_functions_triggers.sql) | Contains auth user provisioning, dynamic profile completion calculator, and the 5-pillar candidate matching algorithm (`calculate_candidate_match_score`). |
| **06** | [`06_rls_policies.sql`](./migrations/06_rls_policies.sql) | Enforces Row Level Security (RLS) across every table to protect candidate privacy and employer data. |
| **07** | [`07_storage.sql`](./migrations/07_storage.sql) | Configures Supabase Storage buckets (`avatars`, `company-logos`, `resumes`) and granular file-access policies. |
| **08** | [`08_seed_data.sql`](./migrations/08_seed_data.sql) | Populates 55+ agricultural specializations, 45+ practical skills, 25+ training categories (HACCP, ISO 22000), and UI demo records. |

## Deployment Methods

### Option A: Via Supabase Dashboard (SQL Editor)
1. Open your project on [database.new](https://database.new) or [app.supabase.com](https://app.supabase.com).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and paste the contents of each file from `01_extensions.sql` through `08_seed_data.sql` and click **Run**.

### Option B: Via Supabase CLI
```bash
# Link to your remote project
supabase link --project-ref your-project-id

# Push all migrations
supabase db push
```

## Security & Privacy Highlights
* **Zero Custom Password Storage**: Relies 100% on Supabase Auth.
* **Granular RLS**: Candidates can only edit their own resumes, educations, and experiences.
* **Anonymous Visibility Mode**: Allows candidates to explore opportunities while hiding identity until direct mutual interest.
* **No Expected Salary in V1**: Respects privacy and eliminates bias during early talent discovery.
