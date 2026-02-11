# ProSafe Work Management System

A comprehensive work management platform with task tracking, project management, team collaboration, and analytics.

## Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Setup

1. **Backend Setup**
```bash
cd backend
npm install
# Update .env with database credentials
npm start
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Test Accounts
```
Admin:    john@prosafe.com / password123
Manager:  jane@prosafe.com / password123
User:     mike@prosafe.com / password123
```

## Features

### Core Features
- ✅ User Authentication (JWT)
- ✅ Task Management (CRUD)
- ✅ Project Management (CRUD)
- ✅ Kanban Board (Drag & Drop)
- ✅ Team Collaboration
- ✅ File Attachments
- ✅ Comments & Activity Logs
- ✅ Notifications & Inbox
- ✅ Analytics & Reports
- ✅ User Profiles
- ✅ Role-Based Access Control

### User Roles
- **Admin**: Full system access, user management, system health
- **Manager**: Team management, project oversight, analytics
- **User**: Personal task/project management, collaboration

## Project Structure

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Auth, permissions, validation
├── routes/          # API endpoints
├── migrations/      # Database schema
└── uploads/         # File storage

frontend/
├── src/
│   ├── pages/       # Page components
│   ├── components/  # Reusable components
│   ├── styles/      # CSS files
│   ├── hooks/       # Custom hooks
│   ├── services/    # API calls
│   └── utils/       # Helper functions
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get own profile
- `PUT /api/users/profile` - Update own profile
- `POST /api/users/profile/upload-photo` - Upload profile photo

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Comments & Activity
- `GET /api/comments/:taskId` - Get task comments
- `POST /api/comments` - Add comment
- `GET /api/activity/:taskId` - Get activity log

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Attachments
- `POST /api/attachments/task` - Upload task attachment
- `POST /api/attachments/project` - Upload project attachment
- `DELETE /api/attachments/:id` - Delete attachment

## Testing

### API Testing
```bash
# Check backend health
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@prosafe.com","password":"password123"}'
```

## Database

### Schema
- users
- projects
- tasks
- comments
- activity_logs
- notifications
- task_attachments
- project_attachments
- project_members

### Migration
Database migration is automatically applied on first setup.

## Security

- JWT authentication for all protected routes
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- File upload validation
- CORS configured
- SQL injection prevention

## Performance

- Profile fetch: < 100ms
- Task operations: < 200ms
- Database queries: < 50ms
- Frontend load: < 2 seconds

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Troubleshooting

### Backend Issues
- Check if PostgreSQL is running
- Verify .env credentials
- Check backend logs

### Frontend Issues
- Clear browser cache
- Check browser console
- Verify backend is accessible

### Database Issues
- Verify PostgreSQL connection
- Check database exists
- Run migration if needed

## License

ISC
