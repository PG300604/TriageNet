-- scripts/apply_rls.sql
-- Row Level Security (RLS) policies for TriageNet PostgreSQL tables.
-- Enables tenant isolation by hospital_id with superadmin and postgres superuser bypass.

-- Helper: bypass when app.is_super_admin = 'true' or user is postgres superuser
CREATE OR REPLACE FUNCTION rls_is_bypass()
RETURNS boolean AS $$
BEGIN
    -- Superadmin bypass via session setting
    IF current_setting('app.is_super_admin', true) = 'true' THEN
        RETURN true;
    END IF;
    -- Postgres superuser bypass
    IF current_user = 'postgres' OR pg_has_role(current_user, 'postgres', 'MEMBER') THEN
        RETURN true;
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =====================================================================
-- 1. patients
-- =====================================================================
ALTER TABLE IF EXISTS patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS patients_tenant_isolation ON patients;
CREATE POLICY patients_tenant_isolation ON patients
    FOR ALL
    TO PUBLIC
    USING (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    )
    WITH CHECK (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    );

-- Superadmin / postgres superuser full-access policy
DROP POLICY IF EXISTS patients_superadmin_bypass ON patients;
CREATE POLICY patients_superadmin_bypass ON patients
    FOR ALL
    TO PUBLIC
    USING (rls_is_bypass())
    WITH CHECK (rls_is_bypass());

-- =====================================================================
-- 2. triage_queue_entry
-- =====================================================================
ALTER TABLE IF EXISTS triage_queue_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS triage_queue_entry FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS triage_queue_tenant_isolation ON triage_queue_entry;
CREATE POLICY triage_queue_tenant_isolation ON triage_queue_entry
    FOR ALL
    TO PUBLIC
    USING (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    )
    WITH CHECK (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    );

DROP POLICY IF EXISTS triage_queue_superadmin_bypass ON triage_queue_entry;
CREATE POLICY triage_queue_superadmin_bypass ON triage_queue_entry
    FOR ALL
    TO PUBLIC
    USING (rls_is_bypass())
    WITH CHECK (rls_is_bypass());

-- =====================================================================
-- 3. oxygen_telemetry
-- =====================================================================
ALTER TABLE IF EXISTS oxygen_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS oxygen_telemetry FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS oxygen_telemetry_tenant_isolation ON oxygen_telemetry;
CREATE POLICY oxygen_telemetry_tenant_isolation ON oxygen_telemetry
    FOR ALL
    TO PUBLIC
    USING (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    )
    WITH CHECK (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    );

DROP POLICY IF EXISTS oxygen_telemetry_superadmin_bypass ON oxygen_telemetry;
CREATE POLICY oxygen_telemetry_superadmin_bypass ON oxygen_telemetry
    FOR ALL
    TO PUBLIC
    USING (rls_is_bypass())
    WITH CHECK (rls_is_bypass());

-- =====================================================================
-- 4. resources
-- =====================================================================
ALTER TABLE IF EXISTS resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS resources_tenant_isolation ON resources;
CREATE POLICY resources_tenant_isolation ON resources
    FOR ALL
    TO PUBLIC
    USING (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    )
    WITH CHECK (
        rls_is_bypass()
        OR hospital_id = current_setting('app.current_hospital_id', true)::uuid
    );

DROP POLICY IF EXISTS resources_superadmin_bypass ON resources;
CREATE POLICY resources_superadmin_bypass ON resources
    FOR ALL
    TO PUBLIC
    USING (rls_is_bypass())
    WITH CHECK (rls_is_bypass());

-- =====================================================================
-- Confirmation output
-- =====================================================================
DO $$
BEGIN
    RAISE NOTICE 'RLS applied: patients, triage_queue_entry, oxygen_telemetry, resources';
    RAISE NOTICE 'Tenant isolation: current_setting(''app.current_hospital_id'', true)::uuid';
    RAISE NOTICE 'Bypass: rls_is_bypass() checks app.is_super_admin=''true'' or postgres superuser';
END $$;
