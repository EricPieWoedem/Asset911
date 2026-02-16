# Asset911 Application Flow Documentation

## Table of Contents
1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Backend Structure](#backend-structure)
5. [Frontend Structure](#frontend-structure)
6. [Authentication Flow](#authentication-flow)
7. [Data Flow](#data-flow)
8. [User Roles & Permissions](#user-roles--permissions)
9. [File Structure & Purpose](#file-structure--purpose)
10. [API Endpoints](#api-endpoints)
11. [Database Models](#database-models)

---

## Application Overview

**Asset911** is a comprehensive asset management platform designed for tracking, managing, and transferring assets. The application supports multiple user types with different permission levels:

- **General Users**: Regular users who can register and manage their personal assets
- **Institution Admins**: Administrators managing assets for institutions
- **ECFATUM Admins**: Super administrators managing institutions and their admins
- **Police Officers**: Law enforcement officers who can view and verify assets

### Key Features
- Asset registration and management
- Asset transfer between users
- Asset tracking and reporting
- Multi-role authentication system
- Institution management
- Public asset directory
- Police verification system

---

## Architecture

The application follows a **monorepo structure** with separate backend and frontend:

```
Asset911/
├── assets911-nodejs/     # Backend (Express.js + MongoDB)
└── assets911-nextjs/     # Frontend (Next.js + React)
```

### Architecture Pattern
- **Backend**: RESTful API with Express.js
- **Frontend**: Server-side rendered React application with Next.js
- **State Management**: Redux Toolkit with RTK Query
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with refresh tokens

---

  ## Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Express.js** | ^4.18.2 | Web framework |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | ^7.5.0 | MongoDB object modeling |
| **jsonwebtoken** | ^9.0.2 | JWT token generation/verification |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **cookie-parser** | ^1.4.6 | Cookie parsing middleware |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **helmet** | ^7.0.0 | Security headers |
| **morgan** | ^1.10.0 | HTTP request logger |
| **multer** | ^1.4.5-lts.1 | File upload handling |
| **winston** | ^3.11.0 | Logging |
| **axios** | ^1.5.1 | HTTP client |
| **dotenv** | ^16.3.1 | Environment variables |
| **nodemon** | ^3.0.1 | Development server auto-reload |

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 13.5.2 | React framework with SSR |
| **React** | 18.2.0 | UI library |
| **Redux Toolkit** | ^1.9.6 | State management |
| **RTK Query** | ^1.9.6 | Data fetching and caching |
| **React Hook Form** | ^7.46.2 | Form management |
| **Zod** | ^3.22.2 | Schema validation |
| **Tailwind CSS** | 3.3.3 | Utility-first CSS |
| **Radix UI** | Various | Accessible UI components |
| **Lucide React** | ^0.279.0 | Icon library |
| **Axios** | ^1.5.1 | HTTP client |
| **@react-oauth/google** | ^0.11.1 | Google OAuth integration |
| **jsPDF** | ^2.5.1 | PDF generation |
| **date-fns** | ^2.30.0 | Date manipulation |
| **React Table** | ^8.10.7 | Table component |

---

## Backend Structure

### Directory Structure

```
assets911-nodejs/
├── config/                    # Configuration files
│   ├── dbConnect.js          # MongoDB connection
│   ├── jwt.js                # JWT token utilities
│   ├── serverSession.js      # Session management
│   ├── corsOptions.js        # CORS configuration
│   ├── credentials.js        # Credential middleware
│   ├── otp.js                # OTP generation/verification
│   └── rolesAndPermissions.js # Permission definitions
├── controllers/              # Business logic handlers
│   ├── general_users/        # General user controllers
│   ├── institutions/         # Institution controllers
│   ├── ecfatum/              # ECFATUM admin controllers
│   ├── police/               # Police controllers
│   └── assetType/            # Asset type controllers
├── models/                   # Mongoose schemas
│   ├── general_users/        # User and asset models
│   ├── institutions/         # Institution models
│   ├── ecfatum/              # ECFATUM admin models
│   ├── police/               # Police officer models
│   ├── brands/               # Brand models
│   └── categories/           # Category models
├── routes/                   # API route definitions
│   ├── general_users/        # User routes
│   ├── institutions/         # Institution routes
│   ├── ecfatum/              # ECFATUM routes
│   ├── police/               # Police routes
│   ├── brands/               # Brand routes
│   └── insurance/            # Insurance routes
├── utils/                    # Utility functions
│   ├── email.js              # Email sending
│   ├── sms.js                # SMS sending
│   └── logger.js             # Logging utilities
├── helpers/                  # Helper functions
│   └── authHelpers.js        # Authentication helpers
├── index.js                  # Application entry point
├── seed.js                   # Database seeding script
└── package.json             # Dependencies
```

### Backend Flow

1. **Server Initialization** (`index.js`)
   - Loads environment variables
   - Connects to MongoDB
   - Configures Express middleware
   - Sets up routes
   - Starts HTTP server

2. **Request Flow**
   ```
   Client Request
   → Express Middleware (helmet, cors, morgan, body-parser)
   → Route Handler
   → Authentication Middleware (verifyToken/verifyTokenWithPermissions)
   → Controller
   → Model (Database Operation)
   → Response
   ```

3. **Authentication Middleware**
   - `verifyToken`: For general user routes
   - `verifyTokenWithPermissions`: For admin routes requiring permissions

---

## Frontend Structure

### Directory Structure

```
assets911-nextjs/
├── app/                      # Next.js app directory (App Router)
│   ├── layout.js             # Root layout
│   ├── page.js               # Home/login page
│   ├── user/                 # User dashboard routes
│   │   ├── layout.jsx        # User layout with sidebar
│   │   ├── page.jsx          # User dashboard
│   │   ├── assets/           # Asset management
│   │   ├── transferred/      # Transfer history
│   │   └── settings/         # User settings
│   ├── institution/          # Institution admin routes
│   │   ├── layout.jsx        # Institution layout
│   │   ├── page.jsx          # Institution dashboard
│   │   ├── assets/           # Institution assets
│   │   ├── history/          # Asset history
│   │   └── ecfatum/          # Institution management
│   ├── police/               # Police routes
│   │   ├── layout.jsx        # Police layout
│   │   └── page.jsx          # Police dashboard
│   ├── directory/            # Public directory
│   │   ├── layout.jsx        # Directory layout
│   │   └── [id]/page.jsx     # Asset detail page
│   ├── login/                # Login pages
│   │   ├── page.jsx          # General login
│   │   └── police/page.jsx   # Police login
│   └── otp/                  # OTP verification
│       └── page.jsx          # OTP input page
├── components/              # React components
│   ├── RequireAuth.jsx       # Authentication wrapper
│   ├── Sidebar.jsx           # Navigation sidebar
│   ├── UserNav.jsx           # User navigation menu
│   ├── AssetCard.jsx         # Asset card component
│   ├── forms/                # Form components
│   └── ui/                   # UI component library
├── redux/                   # State management
│   ├── app/                  # Redux store configuration
│   │   ├── store.js          # Redux store
│   │   └── api/apiSlice.js   # RTK Query base API
│   ├── features/             # Feature slices
│   │   ├── auth/             # Authentication slice
│   │   ├── assets/           # Assets slice
│   │   └── user/             # User slice
│   └── providers.jsx        # Redux provider wrapper
├── public/                  # Static assets
│   └── images/              # Image files
├── lib/                     # Utility libraries
│   └── utils.js             # Helper functions
└── hooks/                   # Custom React hooks
    └── useDebounce.js        # Debounce hook
```

### Frontend Flow

1. **Application Initialization**
   ```
   RootLayout (app/layout.js)
   → Providers (Redux + Google OAuth)
   → Page Component
   → RequireAuth (if protected route)
   → Page Content
   ```

2. **State Management Flow**
   ```
   Component
   → RTK Query Hook (useGetAssetsQuery, etc.)
   → API Slice (apiSlice.js)
   → HTTP Request to Backend
   → Response cached in Redux
   → Component re-renders with data
   ```

3. **Authentication Flow**
   ```
   User Login
   → Auth API Call
   → Token stored in Redux + Cookie
   → RequireAuth checks token
   → Redirects based on user role
   ```

---

## Authentication Flow

### Authentication Methods

1. **Google OAuth**
   - User clicks Google login
   - Google OAuth popup
   - Backend receives Google token
   - Creates/updates user in database
   - Returns JWT access token + refresh token
   - Refresh token stored in HTTP-only cookie

2. **Phone Number + OTP**
   - User enters phone number
   - Backend generates OTP
   - OTP sent via SMS
   - User enters OTP
   - Backend verifies OTP
   - Returns JWT tokens

### Token Management

- **Access Token**: Short-lived (1 day), stored in Redux state
- **Refresh Token**: Longer-lived (2 days), stored in HTTP-only cookie (`jrft`)
- **Token Refresh**: Automatic via RTK Query middleware when 401 received

### Session Management

- **Server Session Endpoint**: `/server-session/get-auth`
  - Validates access token
  - Returns user data
  - Used on page load to restore session

- **Refresh Endpoint**: `/server-session/refresh`
  - Uses refresh token from cookie
  - Returns new access token
  - Automatic refresh on 401 errors

### Protected Routes

Routes are protected using `RequireAuth` component which:
1. Calls `getServerSession` on mount
2. Checks user permissions based on route
3. Redirects unauthorized users
4. Allows access based on role/permissions

---

## Data Flow

### Asset Creation Flow

```
Frontend Form (user/assets/new)
→ React Hook Form validation
→ RTK Query mutation (addAsset)
→ POST /asset/add
→ Backend Controller
→ Mongoose Model.save()
→ MongoDB
→ Response with created asset
→ Redux cache invalidation
→ UI updates
```

### Asset Transfer Flow

```
User initiates transfer
→ Transfer modal form
→ POST /asset/transfer-asset/:id
→ Backend creates TransferRecord
→ OTP sent to new owner
→ New owner confirms with OTP
→ Asset ownership updated
→ Transfer history updated
```

### Asset Retrieval Flow

```
Component mounts
→ RTK Query hook (useGetAssetsQuery)
→ GET /asset/user/?pageSize=X&pageNumber=Y
→ Backend queries MongoDB
→ Returns paginated results
→ Cached in Redux
→ Component renders data
```

---

## User Roles & Permissions

### Permission System

Permissions are numeric codes stored in JWT tokens:

**ECFATUM Permissions** (`rolesAndPermissions.js`)
- `201`: Create Institution
- `202`: Create Institution Admin
- `203`: Read Institution
- `204`: Update Institution

**Institution Permissions**
- `301`: Create Asset
- `302`: Read Asset
- `303`: Update Asset
- `304`: Delete Asset
- `305`: Assign Asset

**Police Permissions**
- `601`: Create Officer
- `602`: Read Asset
- `603`: Update Officer

### User Types

1. **General User** (`/user/*`)
   - No permissions array
   - Can manage own assets
   - Can transfer assets
   - Requires Ghana Card Number

2. **Institution Admin** (`/institution/*`)
   - Requires permission `302` (Read Asset)
   - Can manage institution assets
   - Can assign assets to users
   - Can view asset history

3. **ECFATUM Admin** (`/institution/ecfatum/*`)
   - Requires permission `203` (Read Institution)
   - Can manage institutions
   - Can create institution admins
   - Can view all institutions

4. **Police Officer** (`/police/*`)
   - Institution name must be "police"
   - Can view public assets
   - Can verify assets
   - Can generate reports

---

## File Structure & Purpose

### Backend Files

#### Configuration Files

**`config/dbConnect.js`**
- Purpose: Establishes MongoDB connection
- Exports: `dbConnect()` async function
- Usage: Called in `index.js` on server start

**`config/jwt.js`**
- Purpose: JWT token creation and verification
- Exports:
  - `createToken(user)`: Creates access + refresh tokens
  - `createTokenWithPermissions(admin)`: Creates tokens with permissions
  - `verifyToken`: Middleware for general routes
  - `verifyTokenWithPermissions`: Middleware for admin routes
  - `verifyRefreshToken`: Validates refresh tokens

**`config/serverSession.js`**
- Purpose: Session management endpoints
- Endpoints:
  - `GET /server-session/get-auth`: Get current user session
  - `GET /server-session/refresh`: Refresh access token
  - `GET /server-session/logout`: Logout user

**`config/corsOptions.js`**
- Purpose: CORS configuration
- Exports: `corsOptions` object with allowed origins

**`config/credentials.js`**
- Purpose: Credentials middleware
- Sets `Access-Control-Allow-Credentials` header

**`config/otp.js`**
- Purpose: OTP generation and verification
- Functions: `generateOTP()`, `createOTPToken()`, `verifyOTPToken()`

**`config/rolesAndPermissions.js`**
- Purpose: Permission code definitions
- Exports: Permission objects for each role

#### Models

**`models/general_users/user.model.js`**
- Schema: User document
- Fields: name, email, image, provider, phoneNumber, ghanaCardNumber, password, refreshToken, deleted
- Timestamps: createdAt, updatedAt

**`models/general_users/asset.model.js`**
- Schema: Asset document
- Fields: model, brand, name, type, categoryType, uniqueNumber, dateOfPurchase, price, purchaseReceipt, identificationDetails, otherDetails, images, registrationAddress, presentLocation, owner (ref: User), recentTransferRecord (ref: TransferRecord), status, additionalCategoryData
- Status enum: 'lost', 'sold', 'okay', 'damaged', 'for sale'

**`models/general_users/transfer.model.js`**
- Schema: Asset transfer records
- Tracks asset transfers between users

**`models/institutions/institution.model.js`**
- Schema: Institution document
- Fields: name, phoneNumber, address, email

**`models/institutions/admin.model.js`**
- Schema: Institution admin user
- Fields: email, name, password, permissions, institutionId (ref: Institution), refreshToken

**`models/institutions/asset.model.js`**
- Schema: Institution-owned assets
- Similar to general asset model but for institutions

**`models/ecfatum/admin.model.js`**
- Schema: ECFATUM admin user
- Fields: email, name, password, permissions, refreshToken

**`models/police/officer.model.js`**
- Schema: Police officer user
- Fields: email, name, password, refreshToken

#### Controllers

**`controllers/general_users/auth.controllers.js`**
- `socialAuth`: Handles Google OAuth login
- `refreshToken`: Refreshes access token
- `logOutUser`: Logs out user
- `phoneNumberAuthentication`: Sends OTP to phone
- `verifyUserOTP`: Verifies OTP and logs in

**`controllers/general_users/assets.controllers.js`**
- CRUD operations for assets
- Asset transfer logic
- Asset statistics

**`controllers/institutions/auth.controller.js`**
- Institution admin login
- Token generation with permissions

**`controllers/institutions/assets.controller.js`**
- Institution asset management
- Asset assignment to users

**`controllers/ecfatum/institution.controller.js`**
- Institution CRUD operations
- Institution admin creation

**`controllers/police/assets.controller.js`**
- Police asset viewing
- Asset verification

#### Routes

Routes follow RESTful conventions:
- `POST /auth/*`: Authentication endpoints
- `GET /asset/*`: Asset retrieval
- `POST /asset/*`: Asset creation
- `PATCH /asset/*`: Asset updates
- `DELETE /asset/*`: Asset deletion

### Frontend Files

#### App Router Pages

**`app/layout.js`**
- Root layout component
- Wraps app with Redux Provider and Google OAuth Provider
- Sets global styles

**`app/page.js`**
- Landing/login page
- Supports Google OAuth and phone number login

**`app/user/layout.jsx`**
- User dashboard layout
- Includes Sidebar, UserNav, BottomTabNav
- Wraps children with RequireAuth

**`app/user/page.jsx`**
- User dashboard
- Displays asset statistics
- Shows recent assets

**`app/user/assets/page.jsx`**
- Asset list page
- Pagination and search
- Links to asset details

**`app/user/assets/new/page.jsx`**
- Asset creation form
- Image upload
- Form validation

**`app/institution/layout.jsx`**
- Institution admin layout
- Permission-based sidebar menu

**`app/institution/page.jsx`**
- Institution dashboard
- Institution-specific statistics

#### Components

**`components/RequireAuth.jsx`**
- Authentication wrapper component
- Checks user session
- Validates permissions
- Redirects unauthorized users

**`components/Sidebar.jsx`**
- Navigation sidebar
- Menu items based on user role
- Responsive design

**`components/UserNav.jsx`**
- User navigation menu
- Profile dropdown
- Logout functionality

**`components/AssetCard.jsx`**
- Asset card display component
- Shows asset image, type, brand, model, status

**`components/forms/formFields.jsx`**
- Reusable form field components
- Input, select, textarea components

#### Redux

**`redux/app/store.js`**
- Redux store configuration
- Combines reducers
- Sets up RTK Query middleware

**`redux/app/api/apiSlice.js`**
- Base RTK Query API slice
- Configures base URL
- Handles token refresh
- Sets up automatic re-authentication

**`redux/features/auth/authSlice.js`**
- Auth state slice
- Actions: `setCredentials`, `logOut`
- Selectors: `selectCurrentUser`, `selectCurrentToken`

**`redux/features/auth/authApiSlice.js`**
- Auth API endpoints
- Mutations: login, register, logout
- Queries: getServerSession

**`redux/features/assets/assetsApiSlice.js`**
- Asset API endpoints
- Queries: getAssets, getAsset, getStatistics
- Mutations: addAsset, updateAsset, transferAsset, deleteAsset

---

## API Endpoints

### Authentication Endpoints

**General Users**
- `POST /auth/` - Google OAuth login
- `POST /auth/phone-number` - Request OTP
- `POST /auth/verify-otp` - Verify OTP and login
- `GET /auth/refresh` - Refresh access token
- `GET /auth/logout` - Logout

**Institution Admins**
- `POST /institutions/auth/login` - Institution admin login

**ECFATUM Admins**
- `POST /ecfatum/auth/login` - ECFATUM admin login

**Police**
- `POST /police/auth/login` - Police officer login

### Asset Endpoints

**General Users**
- `GET /asset/user/` - Get user's assets (paginated)
- `GET /asset/:id` - Get single asset
- `POST /asset/add` - Create new asset
- `PATCH /asset/update/:id` - Update asset
- `DELETE /asset/delete/:id` - Delete asset
- `POST /asset/transfer-asset/:id` - Transfer asset
- `GET /asset/user/transferred` - Get transferred assets
- `GET /asset/user/recieved` - Get received assets
- `PATCH /asset/confirm-transfer/:id` - Confirm transfer with OTP
- `PATCH /asset/cancel-asset/:id` - Cancel asset transfer

**Institution**
- `GET /institutions/assets/` - Get institution assets
- `POST /institutions/assets/add` - Add institution asset
- `PATCH /institutions/assets/:id` - Update institution asset
- `POST /institutions/assets/assign` - Assign asset to user

**ECFATUM**
- `GET /ecfatum/institutions/` - Get all institutions
- `POST /ecfatum/institutions/` - Create institution
- `GET /ecfatum/assets/` - Get all assets

**Police**
- `GET /police/assets/:id` - Get asset by ID (public)

### User Endpoints

- `GET /user/stats` - Get user statistics
- `PATCH /user/update` - Update user profile

### Public Endpoints

- `GET /public/:id` - Get public asset information
- `GET /brands` - Get all brands
- `GET /brands/category` - Get asset categories
- `GET /insurance` - Insurance-related endpoints

### Session Endpoints

- `GET /server-session/get-auth` - Get current session
- `GET /server-session/refresh` - Refresh token
- `GET /server-session/logout` - Logout

---

## Database Models

### User Models

**User** (`general_users/user.model`)
```javascript
{
  name: String,
  email: String,
  image: String,
  provider: Enum['google', 'phoneNumber'],
  phoneNumber: String,
  ghanaCardNumber: String,
  password: String (hashed),
  refreshToken: String,
  deleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**InstitutionAdmin** (`institutions/admin.model`)
```javascript
{
  email: String,
  name: String,
  password: String (hashed),
  permissions: [Number],
  institutionId: ObjectId (ref: Institution),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

**EcfatumAdmin** (`ecfatum/admin.model`)
```javascript
{
  email: String,
  name: String,
  password: String (hashed),
  permissions: [Number],
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Officer** (`police/officer.model`)
```javascript
{
  email: String,
  name: String,
  password: String (hashed),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Asset Models

**Asset** (`general_users/asset.model`)
```javascript
{
  model: String (required),
  brand: String (required),
  name: String (required),
  type: String (required),
  categoryType: String,
  uniqueNumber: String (required, unique),
  dateOfPurchase: String (required),
  price: Number (required),
  purchaseReceipt: String,
  identificationDetails: String (required),
  otherDetails: String,
  images: [String],
  registrationAddress: String (required),
  presentLocation: String,
  owner: ObjectId (ref: User, required),
  recentTransferRecord: ObjectId (ref: TransferRecord),
  status: Enum['lost', 'sold', 'okay', 'damaged', 'for sale'] (required),
  additionalCategoryData: Object,
  createdAt: Date,
  updatedAt: Date
}
```

**TransferRecord** (`general_users/transfer.model`)
```javascript
{
  asset: ObjectId (ref: Asset),
  previousOwner: ObjectId (ref: User),
  newOwner: ObjectId (ref: User),
  transferDate: Date,
  status: String,
  otp: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Institution** (`institutions/institution.model`)
```javascript
{
  name: String (required),
  phoneNumber: String (required),
  address: String (required),
  email: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

**InstitutionAsset** (`institutions/asset.model`)
```javascript
{
  // Similar to general Asset but for institutions
  institutionId: ObjectId (ref: Institution),
  assignedTo: ObjectId (ref: User),
  // ... other asset fields
}
```

### Supporting Models

**Brand** (`brands/brands.model`)
- Stores brand and model information

**Category** (`categories/category.model`)
- Asset categories

**AssetType** (`categories/assetType.model`)
- Asset type definitions

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/asset911
JWT_SECRET=your-secret-key
BYPASS_AUTH=false  # Development bypass flag
# SMS service credentials
# Email service credentials
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_AUTH=your-google-client-id
NEXT_PUBLIC_BYPASS_AUTH=false  # Development bypass flag
```

---

## Development Notes

### Authentication Bypass

For development purposes, authentication can be bypassed:

**Backend**: Set `BYPASS_AUTH=true` in `.env`
**Frontend**: Set `NEXT_PUBLIC_BYPASS_AUTH=true` in `.env.local`

This allows UI exploration without authentication setup.

### Database Seeding

Run `yarn seed` in the backend directory to seed the database with sample data.

### File Uploads

Asset images are uploaded using Multer middleware. Files are stored (likely in cloud storage or local filesystem).

### Error Handling

- Backend: Errors are returned as JSON with status codes
- Frontend: RTK Query handles errors automatically, components can access error state

### Logging

- Backend: Winston logger for server-side logging
- Frontend: Console logging (can be enhanced with logging service)

---

## Future Upgrade Considerations

This documentation serves as a baseline for understanding the current application structure. When upgrading:

1. **Database Migration**: MongoDB → PostgreSQL with Prisma
2. **Framework Updates**: Next.js 13 → Latest, React 18 → Latest
3. **Dependency Updates**: All packages to latest versions
4. **Code Modernization**: ES6+ features, TypeScript migration
5. **Architecture Improvements**: API structure, error handling, validation

---

## Conclusion

This document provides a comprehensive overview of the Asset911 application flow, structure, and implementation details. Use this as a reference when planning and executing upgrades to the codebase.
