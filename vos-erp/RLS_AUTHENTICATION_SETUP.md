# Required SQL Commands for Authentication

Run these commands in your Supabase SQL Editor to enable authentication.

## 1. Enable Row Level Security

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## 2. Allow Login Authentication (SELECT for anon)

This policy allows the anon key to read user data during login:

```sql
CREATE POLICY "Allow login authentication"
ON users
FOR SELECT
TO anon
USING (is_deleted = false AND status = 'active');
```

## 3. Allow Session Token Updates (UPDATE for anon)

This policy allows the login API to update the session_token after successful authentication:

```sql
CREATE POLICY "Allow session token update"
ON users
FOR UPDATE
TO anon
USING (is_deleted = false AND status = 'active')
WITH CHECK (is_deleted = false AND status = 'active');
```

## 4. Allow Authenticated Users to Read Own Data

```sql
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (user_id::text = auth.uid()::text);
```

## 5. Allow Admins to Manage All Users

```sql
CREATE POLICY "Admins can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE user_id::text = auth.uid()::text 
    AND is_admin = true
  )
);
```

## How the Authentication Flow Works

1. **Login Request** → User submits email and password
2. **Verify User** → Query users table (SELECT policy allows this)
3. **Verify Password** → Direct string comparison with `user_password`
4. **Create Session** → Generate a unique UUID as session ID
5. **Update Session Token** → Save session ID to `session_token` column (UPDATE policy allows this)
6. **Return JWT** → Send access and refresh tokens as HTTP-only cookies
7. **Middleware Verification** → On each protected route request:
   - Verify JWT signature
   - Query database for user's `session_token`
   - Compare `session_token` with JWT's `jti` claim
   - If they match, allow access; if not, redirect to login

## Testing

After running these SQL commands, test your login:

1. Go to http://localhost:3010/login
2. Enter:
   - Email: `aranjitarchita@gmail.com`
   - Password: `aranjit30`
3. You should be logged in and redirected to the dashboard
4. The middleware should now validate the session correctly

## Troubleshooting

If you still see `MIDDLEWARE_SESSION_MISMATCH`:

1. Check the browser console and network tab for errors
2. Verify the SQL policies were created successfully
3. Check the Supabase logs for RLS policy violations
4. Ensure the `session_token` column is being updated after login

