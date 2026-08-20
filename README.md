# 🎨 Excali-Draw - Collaborative Whiteboard

A real-time collaborative whiteboard application built with Canvas API, allowing multiple users to sketch, draw, and design ideas together on the same board. Perfect for brainstorming sessions, design workshops, and remote collaboration.

**Live Demo:** [https://playboard.byadi.me/](https://playboard.byadi.me/)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Tech Stack Diagram](#architecture--tech-stack-diagram)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Development](#development)
- [Contributing](#contributing)

---

## ✨ Features

- **Real-time Collaboration** - Multiple users can draw on the same canvas simultaneously
- **Live Shape Synchronization** - Drawing shapes are instantly synced across all connected clients
- **User Authentication** - Secure sign-up and sign-in with JWT tokens
- **Room Management** - Create and manage collaborative drawing rooms
- **Shape Operations** - Create, move, and delete shapes in real-time
- **Persistent Storage** - All drawings and changes are saved to the database
- **Responsive Design** - Works seamlessly on desktop and tablet devices
- **Modern UI** - Beautiful gradient backgrounds and smooth animations using Motion

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16 with React 19 (App Router)
- **Styling:** Tailwind CSS 4, PostCSS
- **Animation:** Motion (Framer Motion alternative)
- **State Management:** React Hook Form
- **Icons:** React Icons
- **HTTP Client:** Axios
- **Language:** TypeScript

### Backend - HTTP Server
- **Runtime:** Node.js (v20+)
- **Framework:** Express 5.1
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **CORS:** Cross-origin resource sharing enabled
- **Language:** TypeScript

### Backend - WebSocket Server
- **Library:** ws (native WebSocket)
- **Authentication:** JWT verification
- **Real-time Events:** Shape creation, movement, deletion
- **Language:** TypeScript

### Database
- **ORM:** Prisma 6.12
- **Database:** PostgreSQL
- **Schema Management:** Prisma Migrations

### Monorepo Management
- **Package Manager:** pnpm 9.0.0
- **Build System:** Turborepo 2.5.5
- **Shared Packages:** TypeScript config, ESLint config, UI components

---

## 📐 Architecture & Tech Stack Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js 16 App (React 19 + TypeScript)                 │   │
│  │  ├─ Landing Page (page.tsx)                             │   │
│  │  ├─ Dashboard                                            │   │
│  │  ├─ Canvas Editor                                        │   │
│  │  ├─ Authentication (Sign in/Sign up)                    │   │
│  │  └─ Components (Button, Feature, FAQ, Footer)           │   │
│  │                                                           │   │
│  │  Styling: Tailwind CSS 4 + Motion Animations            │   │
│  │  State: React Hook Form                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           │ HTTP (Auth, CRUD)                 │ WebSocket (Real-time)
           │ (Axios)                           │ (ws client)
           ▼                                    ▼
┌──────────────────────────┐      ┌────────────────────────────┐
│   EXPRESS HTTP SERVER    │      │   WS WebSocket SERVER      │
│   (Port 3001)            │      │   (Port 8090)              │
├──────────────────────────┤      ├────────────────────────────┤
│ Authentication Routes    │      │ Real-time Events:          │
│ ├─ POST /signUp          │      │ ├─ join_room               │
│ ├─ POST /signIn          │      │ ├─ leave_room              │
│ ├─ GET /verify-token     │      │ ├─ chat (draw shape)       │
│                          │      │ ├─ move_shape              │
│ Room Management Routes   │      │ └─ delete_shape            │
│ ├─ POST /create-room     │      │                            │
│ ├─ GET /room/:slug       │      │ JWT Authentication         │
│ ├─ GET /userRooms/:id    │      │ (Token via query param)    │
│ ├─ GET /slug/:id         │      │                            │
│ └─ GET /closeroom/:slug  │      │ Broadcasts changes to      │
│                          │      │ all connected clients      │
│ Chat/Drawing Routes      │      │ in the same room           │
│ └─ GET /chats/:roomId    │      │                            │
│                          │      └────────────────────────────┘
│ Middleware:              │
│ ├─ CORS enabled          │
│ ├─ JWT verification      │
│ └─ JSON parsing          │
└──────────────────────────┘
           │
           └─────────────────────────┬──────────────────────────┘
                                     │ Prisma ORM
                                     ▼
                    ┌────────────────────────────┐
                    │   PostgreSQL Database      │
                    ├────────────────────────────┤
                    │ Tables:                    │
                    │ ├─ users                   │
                    │ │  (id, email, password,   │
                    │ │   name, photo)           │
                    │ ├─ rooms                   │
                    │ │  (id, slug, adminId)     │
                    │ └─ chat                    │
                    │    (id, message, userId,  │
                    │     roomid, timestamp)    │
                    └────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              MONOREPO STRUCTURE (pnpm + Turborepo)              │
├─────────────────────────────────────────────────────────────────┤
│ Shared Packages (in /packages):                                 │
│ ├─ @repo/db - Prisma client & schema                           │
│ ├─ @repo/common-package - Shared types & validation (Zod)      │
│ ├─ @repo/ui - Shared React components                          │
│ ├─ @repo/typescript-config - Shared TypeScript configs         │
│ └─ @repo/eslint-config - Shared ESLint configs                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
excali-draw/
├── apps/
│   ├── excalifn/                  # Next.js Frontend App
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page with hero section
│   │   │   ├── canvas/           # Canvas editor page
│   │   │   ├── Dashboard/        # User dashboard
│   │   │   └── auth/             # Sign in/Sign up pages
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── FeatureSection.tsx
│   │   │   ├── FaqSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── endpoints.ts      # API endpoints config
│   │   ├── assets/
│   │   └── package.json
│   │
│   ├── http-server/              # Express HTTP API Server
│   │   ├── src/
│   │   │   ├── index.ts          # Main Express app & routes
│   │   │   ├── middleware.ts     # JWT authentication middleware
│   │   │   └── express.d.ts      # Express type definitions
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── ws-server/                # WebSocket Server (Real-time)
│       ├── src/
│       │   └── index.ts          # WebSocket connection & handlers
│       ├── .env.example
│       └── package.json
│
├── packages/
│   ├── db/                        # Prisma Database Configuration
│   │   ├── prisma/
│   │   │   └── schema.prisma     # Database schema
│   │   ├── src/
│   │   │   └── db.ts            # Prisma client export
│   │   └── package.json
│   │
│   ├── common-package/            # Shared Types & Validation
│   │   ├── src/
│   │   │   └── types/            # Zod schemas for validation
│   │   └── package.json
│   │
│   ├── ui/                        # Shared React Components
│   │   └── package.json
│   │
│   ├── typescript-config/         # Shared TypeScript configs
│   │   └── base.json
│   │
│   └── eslint-config/             # Shared ESLint configs
│       └── package.json
│
├── pnpm-workspace.yaml            # pnpm workspace configuration
├── turbo.json                     # Turborepo configuration
├── package.json                   # Root package.json with scripts
└── README.md                      # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js:** v18 or higher
- **pnpm:** v9.0.0 or higher
- **PostgreSQL:** v12 or higher (local or remote instance)
- **Git:** For cloning the repository

Install pnpm globally if you don't have it:
```bash
npm install -g pnpm@9.0.0
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/adi-ty-a/excali-draw.git
cd excali-draw
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install dependencies for all apps and packages in the monorepo.

### 3. Set Up Environment Variables

#### For HTTP Server (`apps/http-server/.env`)

```env
# JWT secret for signing/verifying authentication tokens
JWT_SECRET=your-super-secret-jwt-key-here

# Database connection string for Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/excalidraw?sslmode=require"
```

#### For WebSocket Server (`apps/ws-server/.env`)

```env
# JWT secret (must match HTTP server)
JWT_SECRET=your-super-secret-jwt-key-here

# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/excalidraw?sslmode=require"
```

Replace `user`, `password`, `localhost`, and `5432` with your actual PostgreSQL credentials.

### 4. Set Up the Database

```bash
# Navigate to the db package
cd packages/db

# Generate Prisma client and run migrations
pnpm db:push
```

Or use Prisma Studio to visualize your database:
```bash
pnpm dlx prisma studio
```

---

## 🏃 Running Locally

### Option 1: Run All Services (Recommended)

```bash
# From the root directory
pnpm dev
```

This will start:
- Next.js Frontend (http://localhost:3000)
- Express HTTP Server (http://localhost:3001)
- WebSocket Server (ws://localhost:8090)

All services will run concurrently using Turborepo.

### Option 2: Run Individual Services

#### Start Frontend Only
```bash
cd apps/excalifn
pnpm dev
# Opens at http://localhost:3000
```

#### Start HTTP Server Only
```bash
cd apps/http-server
pnpm dev
# Runs on http://localhost:3001
```

#### Start WebSocket Server Only
```bash
cd apps/ws-server
pnpm dev
# Runs on ws://localhost:8090
```

---

## 🔐 Environment Variables

### HTTP Server Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-123` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/excalidraw?sslmode=require` |

### WebSocket Server Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT verification | `your-secret-key-123` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/excalidraw?sslmode=require` |

**Important:** Keep `JWT_SECRET` identical across both servers for proper authentication.

---

## 🗄️ Database Setup

### PostgreSQL Installation

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

**Windows:**
Download and install from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE excalidraw;

# Create user (optional, if needed)
CREATE USER excali WITH PASSWORD 'your_password';
ALTER ROLE excali CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE excalidraw TO excali;
```

### Database Schema

The Prisma schema defines three main tables:

**users** - User accounts
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `name` - User name
- `photo` - Profile photo URL

**rooms** - Collaboration rooms/boards
- `id` - Primary key
- `slug` - Unique room name
- `adminId` - Room creator (foreign key to users)

**chat** - Drawing shapes and messages
- `id` - Primary key
- `message` - Serialized shape/drawing data
- `userId` - User who created it (foreign key to users)
- `roomid` - Room ID (foreign key to rooms)

---

## 🔌 API Endpoints

### Authentication

**POST /signUp**
- Register a new user
- Body: `{ username: string, email: string, password: string }`
- Returns: `{ msg: "signedup" }`

**POST /signIn**
- Login user
- Body: `{ email: string, password: string }`
- Returns: `{ msg: "logged in", token: string }`

**GET /verify-token** ⚠️ Requires JWT
- Verify authentication token
- Headers: `Authorization: <token>`
- Returns: `{ valid: true, userId: number }`

### Room Management

**POST /create-room** ⚠️ Requires JWT
- Create a new collaboration room
- Body: `{ name: string }`
- Returns: Room ID

**GET /room/:slug**
- Get room ID by slug
- Returns: `{ msg: "room found", id: number }`

**GET /userRooms/:id**
- Get all rooms created by user
- Returns: `{ data: [{ slug: string }, ...] }`

**GET /slug/:id**
- Get room slug by ID
- Returns: `{ msg: "slug found", slug: string }`

**GET /closeroom/:slug** ⚠️ Requires JWT
- Delete a room
- Returns: `{ msg: "deleted the room" }`

### Drawing Data

**GET /chats/:roomId**
- Get all drawing shapes in a room (last 50)
- Returns: Array of chat objects with drawing data

---

## 🔌 WebSocket Events

Connect to WebSocket server with JWT token in query parameter:
```
ws://localhost:8090?token=<jwt_token>
```

### Events from Client

**join_room**
```json
{
  "type": "join_room",
  "roomId": 1
}
```

**leave_room**
```json
{
  "type": "leave_room",
  "roomId": 1
}
```

**chat (Create Shape)**
```json
{
  "type": "chat",
  "roomId": 1,
  "message": "{\"shape\": {\"id\": \"shape-1\", \"x\": 100, \"y\": 200, ...}}"
}
```

**move_shape (Update Shape)**
```json
{
  "type": "move_shape",
  "roomId": 1,
  "message": "{\"shape\": {\"id\": \"shape-1\", \"x\": 150, \"y\": 250, ...}}"
}
```

**delete_shape (Remove Shape)**
```json
{
  "type": "delete_shape",
  "roomId": 1,
  "id": "shape-1"
}
```

### Events from Server

Events are broadcast to all connected clients in the same room.

---

## 🛠️ Development

### Build All Packages

```bash
pnpm build
```

### Type Check

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

### Format Code

```bash
pnpm format
```

### Useful Turborepo Commands

```bash
# Build specific package
pnpm turbo build --filter=excalifn

# Develop specific package
pnpm turbo dev --filter=http-server

# Run lint on specific package
pnpm turbo lint --filter=@repo/db
```

### Prisma Commands

```bash
# Generate Prisma client
cd packages/db
pnpm prisma generate

# Push schema changes to database
pnpm prisma db push

# Open Prisma Studio (visual database browser)
pnpm prisma studio

# Create a migration
pnpm prisma migrate dev --name migration_name
```

---

## 📦 Monorepo Structure

This project uses **pnpm workspaces** and **Turborepo** for efficient monorepo management:

- **pnpm**: Fast, disk-space efficient package manager with workspace support
- **Turborepo**: Build system for optimizing incremental builds across the monorepo

All apps and packages share:
- TypeScript configuration via `@repo/typescript-config`
- ESLint configuration via `@repo/eslint-config`
- Database client via `@repo/db`
- Shared types via `@repo/common-package`

---

## 🚀 Deployment

### Frontend (Next.js)
Deploy to Vercel, Netlify, or any Node.js hosting platform.

### Backend Servers
Deploy HTTP and WebSocket servers to:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

### Database
Use a managed PostgreSQL service:
- AWS RDS
- Heroku Postgres
- DigitalOcean Managed Databases
- Railway

---

## 🐛 Troubleshooting

**Port Already in Use**
```bash
# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Kill process on port 3001
kill -9 $(lsof -t -i:3001)

# Kill process on port 8090
kill -9 $(lsof -t -i:8090)
```

**Database Connection Error**
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Ensure database exists: `createdb excalidraw`

**JWT Token Error**
- Ensure `JWT_SECRET` is identical in both servers
- Check token hasn't expired
- Verify token format in WebSocket connection

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [WebSocket (ws) Docs](https://github.com/websockets/ws)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Turborepo Docs](https://turborepo.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙋 Support

For issues, questions, or feature requests, please visit:
- GitHub Issues: [https://github.com/adi-ty-a/excali-draw/issues](https://github.com/adi-ty-a/excali-draw/issues)

---

**Built with ❤️ by [adi-ty-a](https://github.com/adi-ty-a)**
