# Life Management System

A comprehensive full-stack mobile application for managing every aspect of your personal and professional life. Built with React Native (Expo), Node.js, Express, and MongoDB.

## 🚀 Features

- ⏱️ **Time Tracking** - Track work sessions with pause/resume functionality
- ✅ **Task Management** - Kanban-style task organization with priorities, subtasks, and tags
- 💼 **Job Application Tracker** - Track job applications with auto-link parsing
- 📝 **Notes System** - Color-coded notes with pinning and tags
- 💰 **Finance Module** - Income/expense tracking with budgets
- 🔥 **Habit Tracker** - Daily habit tracking with streak calculation
- 👤 **User Profiles** - Gender-specific avatars and customizable profiles
- 🛡️ **Admin Dashboard** - User management and system oversight
- 🔐 **Advanced Auth** - Email verification, password reset, and OAuth
- 🌙 **Dark Mode** - Fully supported dark/light theme system
- 🤖 **AI Integration** - AI-powered daily plans, finance insights, and task suggestions (Google Gemini)
- 🔄 **Multi-device Sync** - Seamless sync across all devices with offline support
- 🔑 **AI Key Management** - BYOK (Bring Your Own Key) support for personalized AI usage
- 🗑️ **Data Retention** - Automated cleanup of old data (90-day policy)

## 📋 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (OAuth)
- **Security**: bcryptjs, helmet
- **AI**: Google Gemini API
- **Email**: Nodemailer
- **Automation**: node-cron

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Storage**: expo-secure-store (native), AsyncStorage (web)
- **Platform**: iOS, Android, Web

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Expo CLI
- Google Gemini API key (for AI features)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lman
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start the server:**
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to mobile-app directory:**
```bash
cd mobile-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Update API URL** in `services/api.js`:
```javascript
// For local development on physical device, use your machine's IP
const API_URL = 'http://192.168.x.x:5000/api';

// For emulator
const API_URL = 'http://10.0.2.2:5000/api';

// For web
const API_URL = 'http://localhost:5000/api';
```

4. **Start Expo:**
```bash
# Start development server
npx expo start

# Start on specific platform
npx expo start --web
npx expo start --android
npx expo start --ios
```

## 🔑 Getting API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to backend `.env` as `GEMINI_API_KEY`
4. Or use the "AI Configuration" in your profile to add your own personal key!

### MongoDB Atlas (Optional)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Add to `.env` as `MONGO_URI`

## 📱 Usage

### Authentication
1. Sign up with name, email, and password
2. Login to access the app
3. JWT token is stored securely

### Time Tracking
- Tap **Start** to begin a work session
- Use **Pause/Resume** as needed
- Tap **Stop** to end the session
- View daily stats on the home screen

### Task Management
- Create tasks with priority levels
- Move tasks through statuses (Todo → In Progress → Done)
- Add subtasks for complex tasks
- Set due dates

### AI Features
- Tap **"🤖 Generate Daily Plan"** on home screen
- Get personalized task prioritization
- Receive habit insights and recommendations
- **New**: Configure your own AI keys in Profile!

## 📂 Project Structure

```
time_managment/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & error handling
│   ├── services/        # External services (AI)
│   ├── cron/            # Scheduled jobs
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
├── mobile-app/
│   ├── app/
│   │   ├── (auth)/      # Login/Signup screens
│   │   ├── (tabs)/      # Main app screens
│   │   └── _layout.js   # Root layout
│   ├── store/           # Zustand state stores
│   ├── services/        # API & utilities
│   └── package.json
├── client-web/
│   ├── src/
│   │   ├── pages/       # Web Pages (Dashboard, Tasks, etc)
│   │   ├── components/  # Reusable UI components
│   │   └── services/    # API & State
│   └── package.json
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Secure token storage (SecureStore on native, AsyncStorage on web)
- Protected API routes
- Helmet middleware for security headers
- Input validation

## 🔄 API Endpoints

### Authentication
- `POST /api/users` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/verify-email` - Verify email
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password

### Admin
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user

### Time Tracking
- `GET /api/timers/active` - Get active timer
- `POST /api/timers/start` - Start timer
- `PUT /api/timers/pause` - Pause timer
- `PUT /api/timers/resume` - Resume timer
- `PUT /api/timers/stop` - Stop timer

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Notes
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Finance
- `GET /api/transactions` - Get transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/monthly-stats` - Get monthly stats
- `GET /api/budgets` - Get budgets
- `POST /api/budgets` - Set budget

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `POST /api/habits/:id/toggle` - Toggle completion

### AI
- `POST /api/ai/daily-plan` - Generate daily plan
- `POST /api/ai/task-suggestions` - Get task suggestions
- `POST /api/ai/habit-insights` - Get habit insights

### Sync
- `GET /api/sync/status` - Get sync status
- `POST /api/sync/bulk` - Bulk sync data

## 🧪 Testing

### Backend Testing
```bash
cd backend
# Test with Postman or curl
curl http://localhost:5000/api/users/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Frontend Testing
- Use Expo Go app on mobile device
- Test on web browser
- Test offline mode by toggling airplane mode

## 🚀 Deployment

### Backend Deployment (Example: Heroku)
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_api_key
git push heroku main
```

### Frontend Deployment
```bash
# Build for production
npx expo build:web

# Or use EAS Build for native apps
npx eas build --platform android
npx eas build --platform ios
```

## 📊 Database Schema

### Key Models
- **User** - Authentication and profile
- **Timer** - Time tracking sessions
- **DailySummary** - Aggregated daily stats
- **PeriodSnapshot** - Period-level data
- **Task** - Task management
- **Job** - Job applications
- **Note** - Notes with tags
- **Transaction** - Financial transactions
- **Budget** - Monthly budgets
- **Habit** - Habit tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**Issue**: `expo-secure-store` error on web
- **Solution**: The app now uses platform-aware storage (fixed automatically)

**Issue**: Cannot connect to backend from mobile device
- **Solution**: Update API_URL in `services/api.js` to your machine's IP address

**Issue**: MongoDB connection error
- **Solution**: Ensure MongoDB is running (`mongod`) or check Atlas connection string

**Issue**: AI features not working
- **Solution**: Verify GEMINI_API_KEY is set in `.env`

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the walkthrough documentation
- Review the implementation plans

## 🎯 Status
**Project is Feature Complete (v1.3.0)**
- [x] Push notifications
- [x] Calendar integration
- [x] Advanced analytics
- [x] Dark mode
- [x] Web/Mobile Parity

---

**Built with ❤️ using React Native and JS, Node.js, and MongoDB**
