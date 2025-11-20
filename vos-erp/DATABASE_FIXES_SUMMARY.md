# Database Table Name Fixes - Summary

## Date: November 20, 2025

## Issues Fixed

### 1. BranchFormDialog.tsx - User Table and Column Issues
**File**: `src/modules/branch-management/components/BranchFormDialog.tsx`

**Problems**:
- Used table name `"user"` instead of `"users"` (plural)
- Attempted to select column `user_mname` which doesn't exist in the database
- Referenced `user_mname` in the User interface
- Displayed `user_mname` in the user options label

**Fixes Applied**:
✅ Changed Supabase query from `.from("user")` to `.from("users")`
✅ Removed `user_mname` from the select statement
✅ Removed `user_mname` field from the User interface
✅ Updated user label to display only `user_fname` and `user_lname`

**Before**:
```typescript
interface User {
  user_id: number;
  user_fname: string;
  user_mname: string;  // ❌ Column doesn't exist
  user_lname: string;
}

const { data, error } = await supabase
  .from("user")  // ❌ Wrong table name
  .select("user_id, user_fname, user_mname, user_lname");  // ❌ user_mname doesn't exist

label: `${user.user_fname} ${user.user_mname} ${user.user_lname}`  // ❌
```

**After**:
```typescript
interface User {
  user_id: number;
  user_fname: string;
  user_lname: string;
}

const { data, error } = await supabase
  .from("users")  // ✅ Correct table name
  .select("user_id, user_fname, user_lname");  // ✅ Only existing columns

label: `${user.user_fname} ${user.user_lname}`  // ✅
```

---

### 2. SalesmanFormDialog.tsx - User Table Name
**File**: `src/modules/salesman-management/components/SalesmanFormDialog.tsx`

**Problem**:
- Used table name `"user"` instead of `"users"` in the fetchUsers function

**Fix Applied**:
✅ Changed Supabase query from `.from("user")` to `.from("users")`

**Before**:
```typescript
async function fetchUsers(op?: string | number) {
  let query = supabase.from("user").select("user_id, user_fname, user_lname");  // ❌
  // ...
}
```

**After**:
```typescript
async function fetchUsers(op?: string | number) {
  let query = supabase.from("users").select("user_id, user_fname, user_lname");  // ✅
  // ...
}
```

---

## Other Errors Observed (Not Fixed - Require Database Schema Updates)

The following errors were observed in the console but were NOT fixed in this update as they require database schema changes:

### Missing Tables:
1. `customer_classification` - 404 error (Feature flag already in place: `NEXT_PUBLIC_ENABLE_CUSTOMER_CLASSIFICATION`)
2. `transaction_type` - 404 error (used in supplier management)

### API Endpoints Not Found:
- `/api/customer` - 404
- Various other `/api/` endpoints

### Recommendations:
1. Create the missing `customer_classification` table in Supabase or keep the feature flag disabled
2. Create the `transaction_types` table (note: code references both `transaction_type` and `transaction_types`)
3. Implement the missing API routes or migrate to direct Supabase client usage

---

## Files Modified

1. ✅ `src/modules/branch-management/components/BranchFormDialog.tsx`
   - Fixed table name: `user` → `users`
   - Removed `user_mname` column references
   - Updated User interface
   - Updated user display label

2. ✅ `src/modules/salesman-management/components/SalesmanFormDialog.tsx`
   - Fixed table name: `user` → `users`

---

## Testing Recommendations

1. Test branch creation/editing with user selection
2. Test salesman creation/editing with user selection
3. Verify no console errors for `users` table queries
4. Verify user dropdowns display correctly (first name + last name only)

---

## Database Schema Notes

Based on the fixes, the following database schema is expected:

### `users` table (not `user`):
- `user_id` (number)
- `user_fname` (string)
- `user_lname` (string)
- ❌ NOT `user_mname` (this column does not exist)

If middle name support is needed in the future, you'll need to:
1. Add `user_mname` column to the `users` table in Supabase
2. Update the queries and interfaces to include it

