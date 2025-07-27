-- Create users table with authentication fields
create table users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text unique not null,
  phone text,
  call_settings jsonb,
  notification_settings jsonb,
  selected_contact jsonb,
  -- Authentication fields
  password_hash text,
  email_verified boolean default false,
  last_login timestamptz,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted boolean default false
);

-- Enable realtime
alter publication supabase_realtime add table users;

-- Legend-State helper to facilitate "Sync only diffs" (changesSince: 'last-sync') mode
-- Updated to handle last_login field
CREATE OR REPLACE FUNCTION handle_times()
    RETURNS trigger AS
    $$
    BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.created_at := now();
        NEW.updated_at := now();
    ELSEIF (TG_OP = 'UPDATE') THEN
        NEW.created_at = OLD.created_at;
        NEW.updated_at := now();
        -- Ne pas modifier last_login automatiquement, seulement via l'application
    END IF;
    RETURN NEW;
    END;
    $$ language plpgsql;

CREATE TRIGGER handle_times
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
EXECUTE PROCEDURE handle_times();

-- Create comprehensive indexes for better performance
create index idx_users_email on users(email) where deleted = false;
create index idx_users_created_at on users(created_at) where deleted = false;
create index idx_users_updated_at on users(updated_at) where deleted = false;
create index idx_users_password_hash on users(password_hash) where deleted = false;

-- Create unique index for email (handles soft deletes)
CREATE UNIQUE INDEX users_email_unique ON users(email) WHERE deleted = false; 