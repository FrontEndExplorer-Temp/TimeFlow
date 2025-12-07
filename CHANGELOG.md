# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-12-07

### Added
- **Authentication & Security**
  - Hashed verification and reset tokens for enhanced security
  - Token validation endpoint (`GET /api/users/validate-reset/:token`) for pre-checking token validity
  - Rate limiting on forgot-password endpoint (5 requests per 15 minutes per IP)
  - SendGrid email API fallback with conditional sending strategy

- **User Experience - Mobile**
  - Improved error messages in login/signup screens (now shows actual error details instead of generic "Something went wrong")
  - Simplified login UI by removing redundant "Have a reset token?" link
  - Deep link support for password reset emails with `MOBILE_APP_SCHEME` environment variable
  - "Open in App" button in reset emails when mobile scheme is configured

- **Notifications**
  - Fixed notification initialization to prevent duplicate scheduling on app reload
  - Added `hasInitialized` flag to notification store for session-based initialization
  - Notifications now scheduled for specific times (8 PM daily summary, Monday 7 PM weekly review)
  - Notifications only schedule when app is not in use (background notifications)

- **React Native Compatibility**
  - Replaced all unsupported CSS `gap` properties with explicit `marginRight`/`marginBottom` for broader device compatibility
  - Fixed spacing in gender selector, color picker, tags, and other list components

### Improved
- **Backend Email Service**
  - Transporter verification on startup to catch configuration issues early
  - Configurable SMTP timeouts and TLS handling via environment variables
  - Better structured error logging for email failures
  - Production-level CORS with dynamic origin validation

### Fixed
- **Password Reset Flow**
  - Reset token expiry increased to 15 minutes
  - Raw tokens sent via email, hashed tokens stored in database
  - Verification email now includes both web link and deep-link option

## [1.2.0] - 2025-11-25

### Added
- **User Experience**
  - Gender-specific avatars (Male/Female) with distinct color themes
  - Improved Onboarding flow with "Skip" option handling
  - Dynamic navigation based on onboarding status

- **Backend Security & Validation**
  - Input validation middleware for all user routes
  - Dynamic SMTP configuration for email services
  - Enhanced error handling for invalid inputs

### Fixed
- **Navigation**
  - Resolved infinite loop in avatar selection for skipped users
  - Fixed "GO_BACK was not handled" error in profile edit
  - Corrected gender persistence in user profile

## [1.1.0] - 2025-11-23

### Added
- **Admin Features**
  - Admin Dashboard for user management
  - Ability to view and delete users
  - Admin-only route protection

- **Advanced Authentication**
  - Email verification workflow
  - Secure "Forgot Password" & Reset flow
  - OAuth integration (Google/GitHub)
  - Enhanced security with middleware

- **Task Enhancements**
  - Rich task details: Priority, Tags, Subtasks, Due Dates
  - Visual indicators for overdue tasks and priorities
  - Improved Task Card UI

- **Job Application Tracker**
  - Smart Link Parsing (LinkedIn, Naukri) for auto-filling job details

- **UI/UX Polish**
  - Global Dark Mode support
  - Centralized Theme System
  - Consistent styling across all modules
  - Responsive design improvements

### Fixed
- **Web Compatibility**
  - Resolved "Unexpected text node" crashes on web
  - Fixed deprecated `shadow*` prop warnings
  - Improved cross-platform rendering

## [1.0.0] - 2024-01-21

### Added
- **Phase 1: Core System & Infrastructure**
  - Authentication module with JWT
  - Time tracking engine with pause/resume
  - Data aggregation and period snapshots
  - Daily summary dashboard
  - Automated cron jobs for midnight processing

- **Phase 2: Productivity Modules**
  - Task manager with Kanban-style workflow
  - Job application tracker
  - Notes system with color coding and pinning

- **Phase 3: Life Modules**
  - Finance module with income/expense tracking
  - Budget management per category
  - Habit tracker with streak calculation

- **Phase 4: AI & Advanced Features**
  - Data retention system (90-day cleanup)
  - AI integration with Google Gemini
  - Daily plan generation
  - Task prioritization suggestions
  - Habit insights and recommendations
  - Multi-device sync optimization
  - Offline queue support

### Technical Improvements
- Platform-aware secure storage (SecureStore for native, AsyncStorage for web)
- Comprehensive error handling
- API interceptors for authentication
- Automated data cleanup
- Conflict resolution for multi-device sync

### Documentation
- Complete README with setup instructions
- API documentation
- Contributing guidelines
- Code comments and inline documentation

