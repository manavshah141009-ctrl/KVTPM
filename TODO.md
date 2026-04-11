# Fix MongoDB Connection Error for Admin Login

## Step 1: Verify and Update MONGODB_URI [PENDING]
- Log into [MongoDB Atlas](https://account.mongodb.com/account/login)
- Find your project/cluster for 'karvichartohpamm' 
- Cluster -> Connect -> Connect your application -> Driver: Node.js -> Version: 8.0 or later
- Copy **SRV connection string** (should look like mongodb+srv://karvichartohpam_db_user:[password]@**cluster0.abc123.mongodb.net**/karvichartohpamm...)
- **Important:** Replace [password] with `LLG8lkhiM42DAd4O`
- Update `.env`:
  ```
  MONGODB_URI=\"your_exact_srv_string_here\"
  ```
- Save .env

## Step 2: Whitelist Your IP [PENDING]
- Atlas Dashboard -> Network Access
- Add IP Address -> `0.0.0.0/0` (ALLOW ACCESS FROM ANYWHERE - dev only!)
- Confirm

## Step 3: Test Database Connection & Seed Admin [PENDING]
```
npm run seed:admin -- admin@example.com YourSecurePassword123
```
- Should output: \"Admin upserted: admin@example.com\"
- If fails, check URI/cluster status

## Step 4: Test Login [PENDING]
```
npm run dev
```
- Go to http://localhost:3000/admin/login
- Login with email: `admin@example.com`, password: `YourSecurePassword123`

## Step 5: Secure Production [LATER]
- Remove 0.0.0.0/0 whitelist
- Add specific IP/server IP
- Change JWT_SECRET to strong random

**Next: Complete Step 1, then tell me 'Step 1 done' to mark progress.**
