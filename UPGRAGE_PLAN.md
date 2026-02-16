# Asset911 Upgrade Plan

## Overview

This document outlines the comprehensive upgrade plan for the Asset911 application. The upgrade will modernize the codebase, improve performance, enhance type safety, and migrate from MongoDB to PostgreSQL with Prisma ORM.

---

## Table of Contents

1. [General Upgrades](#general-upgrades)
2. [Backend Upgrades](#backend-upgrades)
3. [Frontend Upgrades](#frontend-upgrades)
4. [Database Migration](#database-migration)
5. [Implementation Phases](#implementation-phases)
6. [Testing Strategy](#testing-strategy)
7. [Rollback Plan](#rollback-plan)

---

## General Upgrades

### 1. Migrate JavaScript to TypeScript

**Current State**: All code is written in JavaScript (.js, .jsx files)

**Target State**: Full TypeScript implementation (.ts, .tsx files)

#### Backend TypeScript Migration

**Phase 1: Setup**
- [ ] Install TypeScript and type definitions
  ```bash
  npm install -D typescript @types/node @types/express @types/cors @types/cookie-parser @types/bcryptjs @types/jsonwebtoken @types/multer @types/morgan
  ```
- [ ] Create `tsconfig.json` for backend
- [ ] Update `package.json` scripts:
  - `dev`: Use `ts-node-dev` or `tsx` for development
  - `build`: Compile TypeScript to JavaScript
  - `start`: Run compiled JavaScript

**Phase 2: Gradual Migration**
- [ ] Start with configuration files (`config/` directory)
- [ ] Migrate models (will be replaced with Prisma schemas)
- [ ] Migrate controllers
- [ ] Migrate routes
- [ ] Migrate utilities and helpers
- [ ] Migrate main entry point (`index.js`)

**Phase 3: Type Definitions**
- [ ] Create type definitions for:
  - Request/Response types
  - User models and DTOs
  - Asset models and DTOs
  - JWT payload types
  - API response types
  - Error types

**Benefits**:
- Type safety at compile time
- Better IDE autocomplete and IntelliSense
- Easier refactoring
- Self-documenting code
- Catch errors before runtime

#### Frontend TypeScript Migration

**Phase 1: Setup**
- [ ] Install TypeScript dependencies
  ```bash
  npm install -D typescript @types/react @types/react-dom @types/node
  ```
- [ ] Create/update `tsconfig.json` for Next.js
- [ ] Configure Next.js for TypeScript

**Phase 2: Component Migration**
- [ ] Migrate utility files first (`lib/utils.js`, `hooks/`)
- [ ] Migrate Redux slices and API slices
- [ ] Migrate components (start with simpler ones)
- [ ] Migrate pages (App Router pages)
- [ ] Migrate layouts

**Phase 3: Type Definitions**
- [ ] Create types for:
  - Redux state and actions
  - API request/response types
  - Component props
  - Form data types
  - User and asset types

**Migration Strategy**:
- Use `.tsx` extension for React components
- Gradually rename files from `.js` to `.ts` / `.jsx` to `.tsx`
- Use `// @ts-check` comments for gradual migration if needed
- Enable strict mode gradually

---

## Backend Upgrades

### 1. Database Migration: MongoDB → PostgreSQL with Prisma

**Current State**: MongoDB with Mongoose ODM

**Target State**: PostgreSQL with Prisma ORM

#### Phase 1: Prisma Setup

- [ ] Install Prisma CLI and client
  ```bash
  npm install -D prisma
  npm install @prisma/client
  ```

- [ ] Initialize Prisma
  ```bash
  npx prisma init
  ```

- [ ] Configure database connection in `.env`
  ```env
  DATABASE_URL="postgresql://user:password@localhost:5432/asset911?schema=public"
  ```

#### Phase 2: Schema Design

- [ ] Design PostgreSQL schema based on current Mongoose models:
  - [ ] User model → `User` table
  - [ ] Asset model → `Asset` table
  - [ ] TransferRecord model → `TransferRecord` table
  - [ ] Institution model → `Institution` table
  - [ ] InstitutionAdmin model → `InstitutionAdmin` table
  - [ ] EcfatumAdmin model → `EcfatumAdmin` table
  - [ ] Officer model → `Officer` table
  - [ ] Brand model → `Brand` table
  - [ ] Category model → `Category` table
  - [ ] AssetType model → `AssetType` table

- [ ] Define relationships:
  - User → Assets (one-to-many)
  - Asset → TransferRecords (one-to-many)
  - Institution → InstitutionAdmins (one-to-many)
  - Institution → InstitutionAssets (one-to-many)

- [ ] Create `prisma/schema.prisma` with:
  - All models
  - Relationships
  - Indexes
  - Enums (status, provider, etc.)

#### Phase 3: Data Migration

- [ ] Create migration script to export MongoDB data
- [ ] Transform data to PostgreSQL format
- [ ] Import data into PostgreSQL
- [ ] Validate data integrity
- [ ] Create rollback script

#### Phase 4: Code Migration

- [ ] Replace Mongoose models with Prisma Client
- [ ] Update all database queries:
  - `find()` → `findMany()`
  - `findOne()` → `findUnique()` or `findFirst()`
  - `create()` → `create()`
  - `update()` → `update()` or `updateMany()`
  - `delete()` → `delete()` or `deleteMany()`
  - `populate()` → Use Prisma `include` or `select`

- [ ] Update controllers to use Prisma
- [ ] Handle transactions where needed
- [ ] Update seed script to use Prisma

#### Phase 5: Testing & Validation

- [ ] Test all CRUD operations
- [ ] Test relationships and joins
- [ ] Performance testing
- [ ] Validate data consistency

**Migration Considerations**:
- MongoDB ObjectId → PostgreSQL UUID or BigInt
- MongoDB arrays → PostgreSQL arrays or JSON
- MongoDB embedded documents → Separate tables or JSON columns
- MongoDB `$lookup` → PostgreSQL JOINs
- Handle MongoDB-specific features (e.g., `$regex`, `$in`)

### 2. Add Redis for Caching

**Purpose**: Improve performance by caching frequently accessed data

#### Setup

- [ ] Install Redis client
  ```bash
  npm install redis
  npm install -D @types/redis
  ```

- [ ] Install Redis server (Docker recommended)
  ```bash
  docker run -d -p 6379:6379 redis:latest
  ```

- [ ] Create Redis configuration file
  ```typescript
  // config/redis.ts
  import { createClient } from 'redis';
  
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  ```

#### Implementation

- [ ] Cache user sessions
- [ ] Cache frequently accessed assets
- [ ] Cache statistics and aggregations
- [ ] Cache brand and category lists
- [ ] Implement cache invalidation strategies
- [ ] Add cache middleware for common queries

**Caching Strategy**:
- User sessions: TTL 24 hours
- Asset lists: TTL 5 minutes
- Statistics: TTL 10 minutes
- Static data (brands, categories): TTL 1 hour

### 3. Dependency Upgrades

#### Core Dependencies

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| **express** | ^4.18.2 | ^4.21.0 | Latest stable |
| **node** | - | LTS (20.x) | Use Node.js LTS version |
| **jsonwebtoken** | ^9.0.2 | ^9.0.2 | Already latest |
| **bcryptjs** | ^2.4.3 | ^2.4.3 | Consider bcrypt for better performance |
| **cookie-parser** | ^1.4.6 | ^1.4.6 | Latest |
| **cors** | ^2.8.5 | ^2.8.5 | Latest |
| **helmet** | ^7.0.0 | ^8.0.0 | Major version upgrade |
| **morgan** | ^1.10.0 | ^1.10.0 | Latest |
| **multer** | ^1.4.5-lts.1 | ^2.0.0 | Check for breaking changes |
| **winston** | ^3.11.0 | ^3.15.0 | Latest |
| **dotenv** | ^16.3.1 | ^16.4.5 | Latest |
| **axios** | ^1.5.1 | ^1.7.7 | Latest |

#### Development Dependencies

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| **nodemon** | ^3.0.1 | ^3.1.0 | Latest |
| **typescript** | - | ^5.6.0 | New dependency |
| **ts-node-dev** | - | ^2.0.0 | For TypeScript development |
| **@types/node** | - | ^22.0.0 | TypeScript definitions |
| **@types/express** | - | ^5.0.0 | TypeScript definitions |

### 4. Code Quality Improvements

- [ ] Add ESLint with TypeScript support
- [ ] Add Prettier for code formatting
- [ ] Add Husky for git hooks
- [ ] Add lint-staged for pre-commit checks
- [ ] Set up pre-commit hooks for:
  - Type checking
  - Linting
  - Formatting
  - Tests (when added)

### 5. API Improvements

- [ ] Add API versioning (`/api/v1/`)
- [ ] Implement proper error handling middleware
- [ ] Add request validation with Zod or class-validator
- [ ] Add rate limiting
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement proper logging with Winston
- [ ] Add request ID tracking

### 6. Security Enhancements

- [ ] Review and update Helmet configuration
- [ ] Add CSRF protection
- [ ] Implement rate limiting per user/IP
- [ ] Add input sanitization
- [ ] Review JWT implementation
- [ ] Add password strength requirements
- [ ] Implement account lockout after failed attempts
- [ ] Add security headers

### 7. Testing Infrastructure

- [ ] Set up Jest for unit testing
- [ ] Set up Supertest for API testing
- [ ] Add integration tests
- [ ] Set up test database
- [ ] Add test coverage reporting
- [ ] Set up CI/CD pipeline

---

## Frontend Upgrades

### 1. Next.js Upgrade

**Current**: Next.js 13.5.2  
**Target**: Next.js 15.x (latest stable)

#### Migration Steps

- [ ] Review Next.js 14 and 15 migration guides
- [ ] Update `next.config.js` for new features
- [ ] Migrate to App Router (if not fully migrated)
- [ ] Update middleware if needed
- [ ] Update image optimization (Sharp)
- [ ] Review and update API routes
- [ ] Test server components vs client components
- [ ] Update environment variable handling

**Breaking Changes to Address**:
- App Router changes
- Server Components default
- Image component changes
- Font optimization changes

### 2. React Upgrade

**Current**: React 18.2.0  
**Target**: React 19.x (when stable) or latest 18.x

#### Migration Steps

- [ ] Update React and React DOM
- [ ] Review React 19 changes (if upgrading)
- [ ] Update component patterns
- [ ] Review hooks usage
- [ ] Update concurrent features usage

### 3. Dependency Upgrades

#### Core Dependencies

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| **next** | 13.5.2 | 15.x | Major upgrade |
| **react** | 18.2.0 | 19.x or 18.3.x | Major or minor |
| **react-dom** | 18.2.0 | Match React | Match React version |
| **@reduxjs/toolkit** | ^1.9.6 | ^2.3.0 | Major upgrade |
| **react-redux** | ^8.1.2 | ^9.1.0 | Major upgrade |
| **react-hook-form** | ^7.46.2 | ^7.54.0 | Latest 7.x |
| **zod** | ^3.22.2 | ^3.24.0 | Latest |
| **axios** | ^1.5.1 | ^1.7.7 | Latest |
| **date-fns** | ^2.30.0 | ^4.1.0 | Major upgrade (check breaking changes) |

#### UI Dependencies

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| **@radix-ui/react-*** | Various | Latest | Update all Radix UI packages |
| **tailwindcss** | 3.3.3 | 3.4.0 | Latest |
| **lucide-react** | ^0.279.0 | ^0.468.0 | Latest |
| **@tanstack/react-table** | ^8.10.7 | ^8.20.0 | Latest |

#### Other Dependencies

| Package | Current | Target | Notes |
|---------|---------|--------|-------|
| **@react-oauth/google** | ^0.11.1 | ^0.12.0 | Latest |
| **jspdf** | ^2.5.1 | ^2.5.2 | Latest |
| **react-dropzone** | ^14.2.3 | ^14.3.0 | Latest |
| **sharp** | ^0.33.2 | ^0.33.0 | Check compatibility |

### 4. Redux Toolkit Upgrade

**Current**: RTK 1.9.6  
**Target**: RTK 2.3.0

#### Migration Steps

- [ ] Review RTK 2.0 migration guide
- [ ] Update store configuration
- [ ] Update API slice configuration
- [ ] Review middleware changes
- [ ] Update TypeScript types
- [ ] Test all RTK Query endpoints

**Breaking Changes**:
- `createApi` changes
- Middleware changes
- Type changes

### 5. TypeScript Migration

- [ ] Migrate all `.js` files to `.ts`
- [ ] Migrate all `.jsx` files to `.tsx`
- [ ] Add type definitions for:
  - Redux state and actions
  - API responses
  - Component props
  - Form data
  - User and asset types
- [ ] Enable strict mode
- [ ] Add type checking to build process

### 6. Code Quality & Tooling

- [ ] Update ESLint configuration
- [ ] Add Prettier
- [ ] Add Husky and lint-staged
- [ ] Set up pre-commit hooks
- [ ] Add TypeScript strict mode
- [ ] Add import sorting
- [ ] Add path alias validation

### 7. Performance Optimizations

- [ ] Implement code splitting
- [ ] Add image optimization
- [ ] Implement lazy loading
- [ ] Optimize bundle size
- [ ] Add service worker (if needed)
- [ ] Implement proper caching strategies
- [ ] Optimize Redux selectors
- [ ] Add React.memo where appropriate
- [ ] Implement virtual scrolling for large lists

### 8. UI/UX Improvements

- [ ] Review and update component library
- [ ] Improve accessibility (a11y)
- [ ] Add loading states
- [ ] Improve error handling UI
- [ ] Add skeleton loaders
- [ ] Improve form validation feedback
- [ ] Add toast notifications
- [ ] Improve mobile responsiveness

### 9. Testing Infrastructure

- [ ] Set up Jest for unit testing
- [ ] Set up React Testing Library
- [ ] Add component tests
- [ ] Add integration tests
- [ ] Set up E2E testing (Playwright or Cypress)
- [ ] Add visual regression testing
- [ ] Set up test coverage reporting

---

## Database Migration

### MongoDB to PostgreSQL Migration Plan

#### Phase 1: Schema Design (Week 1)

- [ ] Map all Mongoose schemas to Prisma schema
- [ ] Design relationships and foreign keys
- [ ] Plan indexes and constraints
- [ ] Design enums for status fields
- [ ] Create migration scripts

#### Phase 2: Development Environment Setup (Week 1)

- [ ] Set up PostgreSQL database locally
- [ ] Install Prisma CLI
- [ ] Create initial Prisma schema
- [ ] Generate Prisma Client
- [ ] Test basic CRUD operations

#### Phase 3: Parallel Development (Week 2-3)

- [ ] Keep MongoDB running
- [ ] Implement Prisma alongside Mongoose
- [ ] Create data sync script (MongoDB → PostgreSQL)
- [ ] Test all endpoints with PostgreSQL
- [ ] Compare results between databases

#### Phase 4: Data Migration (Week 4)

- [ ] Export all data from MongoDB
- [ ] Transform data format
- [ ] Import into PostgreSQL
- [ ] Validate data integrity
- [ ] Fix any data issues

#### Phase 5: Code Migration (Week 5-6)

- [ ] Replace Mongoose queries with Prisma
- [ ] Update all controllers
- [ ] Update all routes
- [ ] Update seed scripts
- [ ] Remove Mongoose dependencies

#### Phase 6: Testing & Validation (Week 7)

- [ ] Run full test suite
- [ ] Performance testing
- [ ] Load testing
- [ ] Data integrity checks
- [ ] User acceptance testing

#### Phase 7: Deployment (Week 8)

- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Monitor for issues
- [ ] Deploy to production
- [ ] Keep MongoDB as backup for 1 month

### Data Migration Script Structure

```typescript
// scripts/migrate-to-postgres.ts
// 1. Connect to MongoDB
// 2. Connect to PostgreSQL
// 3. Export collections
// 4. Transform data
// 5. Import to PostgreSQL
// 6. Validate
// 7. Generate report
```

### Rollback Plan

- [ ] Keep MongoDB data for 30 days
- [ ] Create rollback script
- [ ] Document rollback procedure
- [ ] Test rollback process

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2) ✅ COMPLETED

**Goals**: Set up TypeScript and development tooling

- [x] Backend TypeScript setup
- [x] Frontend TypeScript setup
- [x] ESLint and Prettier configuration
- [x] Git hooks setup
- [x] Basic type definitions

**Deliverables**:
- ✅ TypeScript compiling successfully
- ✅ Linting and formatting working
- ✅ Pre-commit hooks active

**Completed Date**: February 16, 2026

**Notes**:
- Backend: TypeScript configured with tsconfig.json, ts-node-dev for development
- Frontend: TypeScript configured with Next.js support
- ESLint and Prettier configured for both projects
- Husky and lint-staged set up at root level
- Basic type definitions created in types/ directories

### Phase 2: Database Migration Preparation (Weeks 3-4) ✅ COMPLETED

**Goals**: Prepare for PostgreSQL migration

- [x] Prisma setup
- [x] Schema design
- [x] Migration scripts
- [x] Test environment setup

**Deliverables**:
- ✅ Prisma schema defined
- ✅ Migration scripts ready
- ✅ Test database configured

**Completed Date**: February 16, 2026

**Notes**:
- Prisma 7.4.0 installed and configured
- Complete Prisma schema created based on MongoDB models
- Docker Compose setup for PostgreSQL development database
- Database connection configuration in `.env`
- Seed script created with seed OTPs for all user types
- Prisma Client generated successfully
- Migration guide created for MongoDB to PostgreSQL migration

### Phase 3: Backend Core Migration (Weeks 5-8)

**Goals**: Migrate backend to PostgreSQL and TypeScript

- [ ] Database migration
- [ ] Model migration to Prisma
- [ ] Controller migration
- [ ] Route migration
- [ ] Testing

**Deliverables**:
- Backend running on PostgreSQL
- All endpoints working
- Tests passing

### Phase 4: Backend Enhancements (Weeks 9-10)

**Goals**: Add Redis and improve backend

- [ ] Redis setup
- [ ] Caching implementation
- [ ] API improvements
- [ ] Security enhancements
- [ ] Testing infrastructure

**Deliverables**:
- Redis caching active
- Improved API performance
- Security improvements

### Phase 5: Frontend Core Migration (Weeks 11-14)

**Goals**: Upgrade frontend dependencies and migrate to TypeScript

- [ ] Next.js upgrade
- [ ] React upgrade
- [ ] Redux Toolkit upgrade
- [ ] TypeScript migration
- [ ] Component updates

**Deliverables**:
- Frontend on latest versions
- Full TypeScript implementation
- All features working

### Phase 6: Frontend Enhancements (Weeks 15-16)

**Goals**: Improve frontend quality and performance

- [ ] Performance optimizations
- [ ] UI/UX improvements
- [ ] Testing infrastructure
- [ ] Code quality improvements

**Deliverables**:
- Optimized frontend
- Improved user experience
- Test coverage

### Phase 7: Integration & Testing (Weeks 17-18)

**Goals**: Full system integration and testing

- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing
- [ ] Bug fixes

**Deliverables**:
- Fully tested application
- Performance benchmarks
- Security audit complete

### Phase 8: Deployment & Monitoring (Week 19-20)

**Goals**: Deploy and monitor

- [ ] Staging deployment
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation updates
- [ ] Team training

**Deliverables**:
- Application deployed
- Monitoring active
- Documentation complete

---

## Testing Strategy

### Unit Testing

- [ ] Backend controllers
- [ ] Backend utilities
- [ ] Frontend components
- [ ] Frontend utilities
- [ ] Redux reducers and actions

### Integration Testing

- [ ] API endpoints
- [ ] Database operations
- [ ] Authentication flow
- [ ] Asset CRUD operations
- [ ] Transfer flow

### End-to-End Testing

- [ ] User registration/login
- [ ] Asset creation
- [ ] Asset transfer
- [ ] Institution management
- [ ] Police verification

### Performance Testing

- [ ] API response times
- [ ] Database query performance
- [ ] Frontend load times
- [ ] Cache effectiveness
- [ ] Concurrent user handling

### Security Testing

- [ ] Authentication vulnerabilities
- [ ] Authorization checks
- [ ] Input validation
- [ ] SQL injection (PostgreSQL)
- [ ] XSS vulnerabilities
- [ ] CSRF protection

---

## Rollback Plan

### Database Rollback

1. **Immediate Rollback** (< 1 hour)
   - Switch environment variables back to MongoDB
   - Restart services
   - Verify data integrity

2. **Data Recovery** (< 24 hours)
   - Restore MongoDB from backup
   - Verify data completeness
   - Re-sync if needed

### Code Rollback

1. **Git Rollback**
   - Revert to previous stable commit
   - Deploy previous version
   - Verify functionality

2. **Dependency Rollback**
   - Revert package.json changes
   - Reinstall previous versions
   - Test compatibility

### Monitoring & Alerts

- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Set up performance monitoring
- [ ] Set up database monitoring
- [ ] Configure alerts for critical issues
- [ ] Set up logging aggregation

---

## Success Criteria

### Technical Metrics

- [ ] All tests passing (> 80% coverage)
- [ ] Zero critical bugs
- [ ] API response time < 200ms (p95)
- [ ] Frontend load time < 2 seconds
- [ ] Database query time < 100ms (p95)
- [ ] Cache hit rate > 70%

### Business Metrics

- [ ] All features working as before
- [ ] No data loss
- [ ] Improved performance
- [ ] Better developer experience
- [ ] Easier maintenance

---

## Risk Mitigation

### High-Risk Areas

1. **Database Migration**
   - Risk: Data loss or corruption
   - Mitigation: Comprehensive backups, staged migration, validation scripts

2. **Major Version Upgrades**
   - Risk: Breaking changes
   - Mitigation: Thorough testing, gradual migration, rollback plan

3. **TypeScript Migration**
   - Risk: Introduction of bugs during migration
   - Mitigation: Gradual migration, comprehensive testing

### Contingency Plans

- [ ] Keep MongoDB running in parallel for 1 month
- [ ] Maintain feature flags for gradual rollout
- [ ] Have rollback scripts ready
- [ ] Schedule maintenance windows
- [ ] Have support team on standby

---

## Documentation Updates

- [ ] Update README files
- [ ] Update API documentation
- [ ] Update deployment guides
- [ ] Update development setup guides
- [ ] Create migration runbooks
- [ ] Update architecture diagrams
- [ ] Document new patterns and practices

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Foundation | 2 weeks | TypeScript setup, tooling |
| Phase 2: DB Prep | 2 weeks | Prisma schema, migration scripts |
| Phase 3: Backend Core | 4 weeks | PostgreSQL migration, TypeScript |
| Phase 4: Backend Enhance | 2 weeks | Redis, API improvements |
| Phase 5: Frontend Core | 4 weeks | Next.js upgrade, TypeScript |
| Phase 6: Frontend Enhance | 2 weeks | Performance, UI improvements |
| Phase 7: Integration | 2 weeks | Testing, bug fixes |
| Phase 8: Deployment | 2 weeks | Production deployment |

**Total Estimated Duration**: 20 weeks (~5 months)

---

## Notes

- This is a living document and should be updated as the project progresses
- Each phase should have detailed task breakdowns
- Regular reviews and adjustments should be made
- Team should be consulted on timeline and priorities
- Consider breaking into smaller, more manageable phases if needed

---

## Next Steps

1. Review and approve this plan
2. Assign team members to phases
3. Set up project tracking (Jira, GitHub Projects, etc.)
4. Create detailed task breakdowns for Phase 1
5. Schedule kickoff meeting
6. Begin Phase 1 implementation
