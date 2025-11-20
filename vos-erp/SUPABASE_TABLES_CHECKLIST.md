# Supabase Tables Required for the Application

This document lists all the Supabase tables that the application expects to exist. Please ensure these tables are created in your Supabase database.

## Tables Referenced in the Code

### Branch Management Module
- `branches` - Main branch data table
- `user` - User data for branch head selection

### Supplier Management Module  
- `suppliers` - Main supplier data table
- `delivery_terms` - Delivery terms lookup table (columns: `id`, `delivery_name`)
- `transaction_types` - Transaction types lookup table (columns: `id`, `transaction_type`)

### Customer Management Module
- `customer` - Main customer data table
- `store_type` - Store type lookup table (columns: `id`, `store_type`)
- `discount_type` - Discount type lookup table (columns: `id`, `discount_type`)
- `customer_classification` - Customer classification lookup table (columns: `id`, `classification_name`) - OPTIONAL

### Salesman Management Module
- `salesman` - Main salesman data table
- `operation` or `operations` - Operations lookup table
- `company` - Company lookup table
- `price_types` - Price types lookup table
- `division` - Division lookup table
- `users` - Users table (for salesman user reference)

### Product Management Module
- `segment` - Product segment lookup table
- `sections` - Product sections lookup table

### User Management Module
- `department` - Department lookup table

## Common Issues and Fixes

### 1. Table Name Mismatches
Some tables might use singular vs plural naming. Check your Supabase database and ensure:
- `user` vs `users` - The code uses both, needs consistency
- `operation` vs `operations` - The code uses both, needs consistency

### 2. Missing Tables
If you see 404 errors in the browser console like:
```
GET .../rest/v1/transaction_types 404 (Not Found)
```

This means the table doesn't exist in Supabase. You need to create it.

### 3. Browser Cache
After fixing code issues, you may still see old errors due to browser cache. To clear:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

Or use incognito mode to test with a clean cache.

## Recent Fixes Applied

### BranchFormDialog.tsx
- ✅ Replaced Directus API call (`/items/user`) with Supabase query
- ✅ Now uses `supabase.from("user").select()`

### SupplierFormDialog.tsx  
- ✅ Already migrated to use Supabase
- ⚠️ Ensure `transaction_types` table exists in your database

### CustomerFormDialog.tsx
- ✅ Already migrated to use Supabase
- ⚠️ Ensure `store_type`, `discount_type`, and optionally `customer_classification` tables exist

## Next Steps

1. **Verify all required tables exist in Supabase**
   - Go to your Supabase dashboard
   - Check the "Table Editor" section
   - Create any missing tables listed above

2. **Clear browser cache** (see instructions above)

3. **Check for any remaining errors** in the browser console

4. **If you see table name mismatches**, you can either:
   - Rename the table in Supabase to match the code
   - Update the code to match your Supabase table names

## SQL to Create Missing Lookup Tables

If you're missing any of these lookup tables, here's sample SQL to create them:

```sql
-- Transaction Types
CREATE TABLE IF NOT EXISTS transaction_types (
  id BIGSERIAL PRIMARY KEY,
  transaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Terms  
CREATE TABLE IF NOT EXISTS delivery_terms (
  id BIGSERIAL PRIMARY KEY,
  delivery_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Types
CREATE TABLE IF NOT EXISTS store_type (
  id BIGSERIAL PRIMARY KEY,
  store_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount Types
CREATE TABLE IF NOT EXISTS discount_type (
  id BIGSERIAL PRIMARY KEY,
  discount_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Classification (optional)
CREATE TABLE IF NOT EXISTS customer_classification (
  id BIGSERIAL PRIMARY KEY,
  classification_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Remember to also set up appropriate Row Level Security (RLS) policies for these tables!

