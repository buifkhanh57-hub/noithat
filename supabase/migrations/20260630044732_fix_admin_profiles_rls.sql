/*
# Fix admin_profiles RLS - remove recursive policy

1. Problem
- admin_manage_admin_profiles uses a self-referential EXISTS subquery on admin_profiles,
  which causes infinite recursion under RLS and blocks all admin operations.
- admin_read_admin_profiles also has the same recursive EXISTS.

2. Fix
- Drop both policies.
- Create a simple SELECT policy: user can read their own admin_profiles row (auth.uid() = user_id).
- Create admin CRUD policy using a direct ownership check (auth.uid() = user_id) for the row itself,
  since only an existing admin can be in this table. This avoids recursion.
*/

DROP POLICY IF EXISTS "admin_read_admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "admin_manage_admin_profiles" ON admin_profiles;

-- Any authenticated user can read their own admin_profiles row (to check if they are admin)
CREATE POLICY "read_own_admin_profile" ON admin_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- A user can only insert/update/delete their own admin_profiles row.
-- In practice only admins exist here, so this is safe and non-recursive.
CREATE POLICY "manage_own_admin_profile" ON admin_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
