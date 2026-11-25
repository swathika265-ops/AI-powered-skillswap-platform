# SkillSwap — AI-Powered Skill Exchange Platform

A full-stack web application for verified skill exchange and collaborative learning. Learn skills from verified mentors, teach your verified skills, and earn time credits.

## Features

- **Skill Verification** — Three-step verification: proof submission → admin approval → skill assessment (70% pass mark)
- **AI-Powered Matching** — Intelligent mentor-learner matching based on skills, language, availability, and reputation
- **Time Credits** — Fair exchange system: 1 hour of teaching = 1 credit earned
- **Real-Time Chat** — Socket.IO messaging with multilingual translation
- **Voice & Translation** — Voice input, spoken replies, and real-time translation
- **External Meetings** — Integration with Google Meet, Zoom, and Microsoft Teams
- **AI Learning Roadmaps** — Personalized learning paths with progress tracking
- **Reputation System** — Separate from credits; tracks reliability and trustworthiness
- **Challenges & Projects** — Collaborative learning challenges with submissions
- **Admin Dashboard** — User management, proof reviews, analytics, and platform configuration
- **Anti-Cheating Assessment** — Fullscreen mode, tab-switch detection, violation tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), React Router, Axios, Lucide Icons |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT, bcryptjs |
| AI | Configurable AI provider (OpenAI compatible) |
| Translation | LibreTranslate / configurable provider |

## Prerequisites

- **Node.js** v18+ and npm
- **MongoDB Atlas** account (free tier works)
- **Git** (optional)

## Setup Instructions (Windows PowerShell)

### 1. Clone or navigate to the project

```powershell
cd C:\Users\itsmy\skill\skillswap
```

### 2. Backend Setup

```powershell
cd backend
npm install
```

### 3. Configure Backend Environment

Copy the example environment file and edit it:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set your **MongoDB Atlas connection string**:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillswap?retryWrites=true&w=majority
```

### 4. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Add your IP to the access list (or allow all: `0.0.0.0/0`)
5. Get the connection string and paste it in `.env`

### 5. Start Backend

```powershell
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: <cluster>.mongodb.net
✅ Admin user seeded: admin@skillswap.com
✅ Default platform settings seeded
🚀 SkillSwap API Server
   Environment: development
   Port: 5000
   Health: http://localhost:5000/api/health
```

### 6. Frontend Setup

Open a new terminal:

```powershell
cd frontend
npm install
```

### 7. Start Frontend

```powershell
npm run dev
```

Frontend runs at: http://localhost:5173

### 8. Verify

- Backend health check: http://localhost:5000/api/health
- Frontend: http://localhost:5173

## Default Admin Account

```
Email: admin@skillswap.com
Password: Admin@123456
```

⚠️ **Change these credentials in production!**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| ... | ... | More endpoints added per phase |

Full API documentation: [docs/api-documentation.md](docs/api-documentation.md)

## Project Structure

```
skillswap/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth, etc.)
│   │   ├── pages/         # Route pages
│   │   ├── services/      # API client
│   │   ├── App.jsx        # Main app with routing
│   │   └── main.jsx       # Entry point
│   └── package.json
├── backend/               # Express.js API server
│   ├── config/            # DB connection, env config
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── sockets/           # Socket.IO handlers
│   ├── utils/             # Helpers, seed
│   ├── server.js          # Express server
│   └── package.json
├── docs/                  # Documentation
└── README.md
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | Required |
| `JWT_SECRET` | Secret for JWT signing | Required |
| `PORT` | Server port | 5000 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `DEFAULT_PASS_PERCENTAGE` | Assessment pass mark | 70 |
| `AI_API_KEY` | AI provider API key | Optional |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | http://localhost:5000/api |
| `VITE_SOCKET_URL` | Socket.IO server URL | http://localhost:5000 |

## Testing

```powershell
cd backend
npm test
```

## Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check MONGODB_URI, whitelist your IP in Atlas |
| Port 5000 in use | Change PORT in .env |
| CORS errors | Ensure FRONTEND_URL matches your frontend URL |

## License

ISC
