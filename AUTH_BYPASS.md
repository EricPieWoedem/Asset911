# Authentication Bypass Guide

This guide explains how to bypass authentication for development purposes, allowing you to navigate through the frontend UI without needing to authenticate.

## Overview

The codebase now supports a development mode that bypasses authentication checks. This allows you to explore the UI without setting up authentication or a backend connection.

## How to Enable

### Frontend (Next.js)

1. Open the `.env.local` file in the `assets911-nextjs` directory
2. Add the following line:
   ```
   NEXT_PUBLIC_BYPASS_AUTH=true
   ```
3. Restart your Next.js development server:
   ```bash
   cd assets911-nextjs
   yarn dev
   ```

### Backend (Node.js) - Optional

If you want to bypass backend authentication as well (useful if you're making API calls):

1. Open the `.env` file in the `assets911-nodejs` directory
2. Add the following line:
   ```
   BYPASS_AUTH=true
   ```
3. Restart your Node.js server:
   ```bash
   cd assets911-nodejs
   yarn dev
   ```

## How It Works

### Frontend Bypass

When `NEXT_PUBLIC_BYPASS_AUTH=true` is set:

- The `RequireAuth` component automatically allows access to all protected routes
- Mock user data is returned based on the current route:
  - `/user/*` routes → Regular user with no permissions
  - `/institution/*` routes → Institution admin with permissions [302]
  - `/institution/ecfatum/*` routes → ECFATUM admin with permissions [201, 203]
  - `/police/*` routes → Police officer
- The `getServerSession` API call returns mock data instead of calling the backend

### Backend Bypass

When `BYPASS_AUTH=true` is set:

- All JWT middleware (`verifyToken`, `verifyTokenWithPermissions`) automatically passes requests through
- Mock user data is attached to the request object
- The `/server-session/get-auth` endpoint returns mock user data

## Mock User Data

The bypass mode uses different mock users depending on the route:

### Regular User (`/user/*`)
```json
{
  "name": "Dev User",
  "email": "dev@user.com",
  "permissions": [],
  "institutionName": null,
  "accessToken": "dev-bypass-token",
  "ghanaCardNumber": "GHA-123456789-0"
}
```

### Institution Admin (`/institution/*`)
```json
{
  "name": "Dev Institution Admin",
  "email": "dev@institution.com",
  "permissions": [302],
  "institutionName": { "id": "institution", "name": "Test Institution" },
  "accessToken": "dev-bypass-token"
}
```

### ECFATUM Admin (`/institution/ecfatum/*`)
```json
{
  "name": "Dev ECFATUM Admin",
  "email": "dev@ecfatum.com",
  "permissions": [201, 203],
  "institutionName": { "id": "ecfatum", "name": "ECFATUM" },
  "accessToken": "dev-bypass-token"
}
```

### Police Officer (`/police/*`)
```json
{
  "name": "Dev Police Officer",
  "email": "dev@police.com",
  "permissions": [],
  "institutionName": { "id": "police", "name": "Police" },
  "accessToken": "dev-bypass-token"
}
```

## How to Disable

Simply remove or set the environment variables to `false`:

**Frontend:**
```bash
# In assets911-nextjs/.env.local
NEXT_PUBLIC_BYPASS_AUTH=false
# or remove the line entirely
```

**Backend:**
```bash
# In assets911-nodejs/.env
BYPASS_AUTH=false
# or remove the line entirely
```

Then restart your servers.

## Important Notes

⚠️ **Security Warning**: 
- **NEVER** commit these environment variables with `true` values to production
- **NEVER** enable bypass mode in production environments
- This feature is intended **ONLY** for local development

⚠️ **Limitations**:
- API calls that require real data will still fail or return empty results
- Some features may not work correctly without a real backend connection
- Database operations will not work with bypass mode enabled

## Troubleshooting

### Frontend still redirects to login
- Make sure `NEXT_PUBLIC_BYPASS_AUTH=true` is set (note the `NEXT_PUBLIC_` prefix)
- Restart your Next.js dev server after changing `.env.local`
- Clear your browser cache/localStorage

### Backend still returns 401 errors
- Make sure `BYPASS_AUTH=true` is set in the backend `.env` file
- Restart your Node.js server after changing `.env`
- Check that the environment variable is being loaded correctly

### Mock user doesn't match route
- The mock user is determined by the current pathname
- Navigate to the route you want to test first, then refresh
- The mock data is set when the component mounts

## Files Modified

- `assets911-nextjs/components/RequireAuth.jsx` - Added bypass logic
- `assets911-nextjs/redux/features/auth/authApiSlice.js` - Added mock data for getServerSession
- `assets911-nodejs/config/jwt.js` - Added bypass to verifyToken and verifyTokenWithPermissions
- `assets911-nodejs/config/serverSession.js` - Added bypass to get-auth endpoint
