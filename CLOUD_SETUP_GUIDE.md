# 🚀 SUPABASE CLOUD DATABASE SETUP GUIDE

## Steps to Connect and Setup Your Cloud Database

### 📋 **Method 1: Using Supabase Dashboard (RECOMMENDED)**

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Login to your account
   - Select your project: `luiidomyeinydwttqrmc`

2. **Apply the Migration Script**
   - Navigate to **SQL Editor** in the left sidebar
   - Click **"New Query"**
   - Copy the entire content from `cloud_database_setup.sql`
   - Paste it into the SQL editor
   - Click **"RUN"** to execute

3. **Verify Setup**
   - Go to **Database** → **Tables** to see all created tables
   - Check that you have: `profiles`, `teacher_profiles`, `teacher_verifications`, `admin_profiles`, etc.
   - Go to **Authentication** → **Policies** to verify RLS policies

### 📋 **Method 2: Using Command Line (Alternative)**

If the dashboard method doesn't work, try these commands:

```bash
# Install Supabase CLI (if not done)
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Try linking to your project
supabase link --project-ref luiidomyeinydwttqrmc

# If linking works, push migrations
supabase db push
```

### 📋 **Method 3: Direct Database Connection**

If you have connection issues, try connecting via a database client:

**Connection Details:**
- Host: `db.luiidomyeinydwttqrmc.supabase.co`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: `makrufmm17.`

**Using TablePlus, DBeaver, or pgAdmin:**
1. Create new connection with above details
2. Connect to the database
3. Open SQL editor
4. Run the `cloud_database_setup.sql` script

### ✅ **What This Script Does:**

1. **Creates all necessary tables:**
   - `profiles` - User profiles with admin flag
   - `teacher_profiles` - Teacher-specific information
   - `teacher_verifications` - Teacher verification status
   - `admin_profiles` - Admin user management
   - `lessons`, `shop_items`, `events`, etc. - App content

2. **Sets up clean RLS policies:**
   - Removes any conflicting policies
   - Creates secure, non-overlapping policies
   - Disables RLS for teacher tables (as per our fixes)

3. **Inserts sample data:**
   - Verified teacher accounts (`qalvinahmad@gmail.com`, `111202013071@mhs.dinus.ac.id`)
   - Sample shop items, lessons, events
   - Learning content and testimonials

4. **Creates necessary indexes:**
   - Performance optimizations for queries
   - Email lookups, status filtering

### 🔧 **After Setup:**

1. **Test the connection:**
   ```bash
   # Test with your app
   npm run dev
   
   # Try teacher login with:
   # Email: qalvinahmad@gmail.com
   # Password: [your-auth-password]
   # Teacher Code: T123
   ```

2. **Verify in Dashboard:**
   - Check **Database** → **Tables** for all tables
   - Check **Authentication** → **Users** for any existing users
   - Check **Authentication** → **Policies** for RLS policies

### 🚨 **If You Get Errors:**

1. **"Relation already exists"**: This is normal, the script uses `IF NOT EXISTS`
2. **"Policy already exists"**: The script handles this with `DROP POLICY IF EXISTS`
3. **Connection issues**: Try using the Supabase Dashboard method first

### 📞 **Next Steps:**

After running the script successfully:
1. Switch your app back to production: `./switch-env.sh prod`
2. Test the authentication flow
3. Verify all features work with cloud database
4. Your local and cloud databases will now be in sync!

---

**Ready to proceed?** Start with **Method 1** using the Supabase Dashboard - it's the most reliable approach!
