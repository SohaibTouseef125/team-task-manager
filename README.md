# Team Task Manager

A comprehensive team task management application built with a modern tech stack featuring React frontend and Node.js/Express backend with PostgreSQL database.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Deletion Guide](#deletion-guide)

## Features

### User Management
- User registration and authentication
- Profile management with avatar upload
- Password management

### Team Management
- Create and manage teams
- Add/remove team members
- Assign roles (admin/member) to team members

### Task Management
- Create, update, and delete tasks
- Assign tasks to team members
- Set priorities (low, medium, high)
- Set due dates
- Track task status (todo, in_progress, in_review, completed)

### Notifications
- Real-time notifications system
- Track task assignments and updates
- View notification history

### Dashboard
- Overview of tasks and teams
- Task statistics and analytics
- Recent activity feed

## Tech Stack

### Frontend
- React 18+
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Lucide React (icons)
- React Router DOM (navigation)
- Axios (HTTP requests)
- Sonner (notifications)

### Backend
- Node.js
- Express.js
- PostgreSQL (database)
- Knex.js (query builder)
- Passport.js (authentication)
- Bcrypt (password hashing)
- Multer (file uploads)
- Helmet (security)
- CORS (Cross-Origin Resource Sharing)
- Morgan (logging)

### Database
- PostgreSQL

### Development Tools
- Nodemon (auto-restart during development)
- ESLint (linting)
- Concurrently (running multiple scripts)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (version 18 or higher)
- npm or yarn package manager
- PostgreSQL database server
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd team-task-manager
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Configuration

### 1. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=8000
DATABASE_URL=postgresql://username:password@localhost:5432/team_task_manager
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-super-secret-session-key-here-make-it-long-and-random
NODE_ENV=development
```

### 2. Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
REACT_APP_API_URL=http://localhost:8000/api
```

## Database Setup

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE team_task_manager;
-- Optionally create a dedicated user
CREATE USER team_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE team_task_manager TO team_user;
```

### 2. Run Database Migrations

```bash
cd backend
npx knex migrate:latest
```

This will create the necessary tables:
- users
- teams
- tasks
- memberships
- sessions
- notifications

## Running the Application

### Development Mode

#### Method 1: Separate Terminals

Terminal 1 (Backend):
```bash
cd backend
npm start
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

#### Method 2: Using Concurrently (if configured)

```bash
# From project root
npm run dev  # If this script is configured in root package.json
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Backend Health Check: http://localhost:8000/health

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Teams Endpoints
- `GET /api/teams/all` - Get all teams for user
- `POST /api/teams/add` - Create new team
- `GET /api/teams/get/:id` - Get team by ID
- `PUT /api/teams/update/:id` - Update team
- `DELETE /api/teams/delete/:id` - Delete team
- `GET /api/teams/:id/members` - Get team members
- `POST /api/teams/:id/members` - Add member to team
- `DELETE /api/teams/:id/members/:userId` - Remove member from team
- `PUT /api/teams/:id/members/:userId` - Update member role

### Tasks Endpoints
- `GET /api/tasks/all` - Get all tasks with filters
- `POST /api/tasks/add` - Create new task
- `GET /api/tasks/get/:id` - Get task by ID
- `PUT /api/tasks/update/:id` - Update task
- `DELETE /api/tasks/delete/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### Users Endpoints
- `GET /api/users/all` - Get all users
- `GET /api/users/get/:id` - Get user by ID
- `GET /api/users/get/:id/tasks` - Get user's tasks
- `PUT /api/users/update/:id` - Update user profile
- `POST /api/users/upload-avatar` - Upload user avatar

### Notifications Endpoints
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/count` - Get unread notification count
- `PUT /api/notifications/read/:id` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── passport.js
│   │   │   └── session.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── teamController.js
│   │   │   ├── taskController.js
│   │   │   ├── userController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── upload.js
│   │   │   └── validation.js
│   │   ├── migrations/
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── teams.js
│   │       ├── tasks.js
│   │       ├── users.js
│   │       └── notifications.js
│   ├── uploads/
│   │   └── avatars/
│   ├── knexfile.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
├── README.md
└── .gitignore
```

## Development

### Backend Development
- Use `npm start` to run with nodemon for auto-restart
- API endpoints are documented above
- Database migrations are handled with Knex
- All authentication is session-based using Passport.js

### Frontend Development
- Use `npm run dev` for development server
- Components are organized by feature
- State management is handled with React Context and hooks
- API calls are centralized in services/api.js

## Deployment

### Production Build
1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy backend with built frontend:
- Ensure environment variables are set for production
- Run database migrations: `npx knex migrate:latest`
- Start the server: `node server.js`

### Environment Variables for Production
```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://username:password@host:port/database
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=your-production-secret-key
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Verify database credentials in `.env`
   - Run migrations: `npx knex migrate:latest`

2. **Authentication Issues**
   - Check session secret is set in `.env`
   - Ensure CORS settings allow your frontend domain

3. **File Upload Issues**
   - Verify `uploads` directory exists and has write permissions
   - Check file size limits in upload middleware

4. **Frontend Build Issues**
   - Ensure API URL is correctly set in frontend `.env`
   - Check that backend is running when developing

### Debugging Tips
- Check server logs for error messages
- Use browser developer tools to inspect network requests
- Verify environment variables are loaded correctly
- Test API endpoints directly with tools like Postman

## Deletion Guide

### Complete Project Removal

⚠️ **Warning**: This will permanently delete all project files and data. Make sure to backup any important data before proceeding.

#### 1. Stop Running Services
```bash
# Kill any running processes
pkill -f "node"  # Kills all node processes (be careful!)
# Or more specifically:
pkill -f "nodemon"
pkill -f "vite"
```

#### 2. Remove Database (Optional - This will delete all data)
```sql
-- Connect to PostgreSQL as superuser
DROP DATABASE IF EXISTS team_task_manager;
DROP USER IF EXISTS team_user;  -- Only if you created a dedicated user
```

#### 3. Remove Project Directory
```bash
# Navigate to parent directory of project
cd /path/to/parent/directory
rm -rf team-task-manager
```

#### 4. Clean Up (Optional)
- Remove any globally installed packages if needed
- Clear npm/yarn cache if experiencing issues: `npm cache clean --force`
- Remove any temporary files or caches

### Selective Component Removal

#### Remove Backend Only
```bash
rm -rf backend/
```

#### Remove Frontend Only
```bash
rm -rf frontend/
```

#### Remove Database Data Only (Keep Schema)
```sql
-- Connect to your database
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE teams RESTART IDENTITY CASCADE;
TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;
TRUNCATE TABLE memberships RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
-- Note: CASCADE will delete related records in dependent tables
```

#### Remove Uploaded Files Only
```bash
# Remove all uploaded avatars (this cannot be undone)
rm -rf backend/uploads/avatars/*
```

#### Remove Database Schema and Data
```sql
-- Connect to your database
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
-- This removes all tables and data but keeps the database
```

### Backup Before Deletion

Before performing any deletion, consider backing up:

#### Backup Database
```bash
# Create a backup of the database
pg_dump -U username -h localhost -p 5432 team_task_manager > backup.sql
```

#### Backup Uploaded Files
```bash
# Copy uploads directory to safe location
cp -r backend/uploads/ /safe/location/uploads_backup/
```

#### Backup Source Code
```bash
# Create a compressed archive
tar -czf team-task-manager-backup.tar.gz team-task-manager/
```

### Reinstall After Deletion

If you need to reinstall after deletion:

1. Follow the installation steps from the beginning
2. Restore database from backup if needed
3. Restore uploaded files if needed
4. Run database migrations if installing fresh

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please file an issue in the repository.