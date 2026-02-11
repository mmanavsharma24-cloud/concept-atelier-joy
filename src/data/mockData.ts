import { TeamMember, Project, Task, Activity } from './types';

export const teamMembers: TeamMember[] = [
  { id: 'u1', name: 'Alex Chen', role: 'Lead Engineer', avatar: '', email: 'alex@team.io' },
  { id: 'u2', name: 'Sarah Kim', role: 'Frontend Dev', avatar: '', email: 'sarah@team.io' },
  { id: 'u3', name: 'Marcus Johnson', role: 'Backend Dev', avatar: '', email: 'marcus@team.io' },
  { id: 'u4', name: 'Emily Davis', role: 'Designer', avatar: '', email: 'emily@team.io' },
  { id: 'u5', name: 'James Wilson', role: 'DevOps', avatar: '', email: 'james@team.io' },
  { id: 'u6', name: 'Priya Patel', role: 'QA Engineer', avatar: '', email: 'priya@team.io' },
];

export const projects: Project[] = [
  { id: 'p1', name: 'Platform Redesign', description: 'Complete UI/UX overhaul of the main platform', status: 'active', progress: 68, memberIds: ['u1', 'u2', 'u4'], dueDate: '2026-03-15', createdAt: '2026-01-10' },
  { id: 'p2', name: 'API v3 Migration', description: 'Migrate all endpoints to v3 REST API', status: 'active', progress: 42, memberIds: ['u1', 'u3', 'u5'], dueDate: '2026-04-01', createdAt: '2026-01-20' },
  { id: 'p3', name: 'Mobile App MVP', description: 'First release of the mobile companion app', status: 'active', progress: 25, memberIds: ['u2', 'u3', 'u4'], dueDate: '2026-05-30', createdAt: '2026-02-01' },
  { id: 'p4', name: 'CI/CD Pipeline', description: 'Set up automated testing and deployment', status: 'completed', progress: 100, memberIds: ['u5', 'u6'], dueDate: '2026-02-01', createdAt: '2025-12-15' },
  { id: 'p5', name: 'Auth System Upgrade', description: 'Implement SSO and MFA across all services', status: 'on_hold', progress: 15, memberIds: ['u1', 'u3'], dueDate: '2026-06-01', createdAt: '2026-02-05' },
];

export const tasks: Task[] = [
  { id: 't1', title: 'Design new navigation system', description: 'Create wireframes and high-fidelity mockups for the new sidebar navigation.', status: 'in_progress', priority: 'high', assigneeId: 'u4', projectId: 'p1', labels: ['design', 'ux'], dueDate: '2026-02-20', createdAt: '2026-02-01', updatedAt: '2026-02-10', comments: [{ id: 'c1', authorId: 'u1', content: 'Let\'s use a collapsible sidebar pattern.', createdAt: '2026-02-08' }] },
  { id: 't2', title: 'Implement dashboard widgets', description: 'Build reusable chart and summary card components for the dashboard.', status: 'todo', priority: 'high', assigneeId: 'u2', projectId: 'p1', labels: ['frontend', 'dashboard'], dueDate: '2026-02-25', createdAt: '2026-02-03', updatedAt: '2026-02-09', comments: [] },
  { id: 't3', title: 'Migrate user endpoints', description: 'Move /users/* from v2 to v3 API with backward compatibility.', status: 'in_review', priority: 'critical', assigneeId: 'u3', projectId: 'p2', labels: ['backend', 'api'], dueDate: '2026-02-15', createdAt: '2026-01-25', updatedAt: '2026-02-10', comments: [{ id: 'c2', authorId: 'u5', content: 'Need to update the rate limiter config too.', createdAt: '2026-02-09' }] },
  { id: 't4', title: 'Set up React Native project', description: 'Initialize the RN project with navigation, state management, and CI.', status: 'done', priority: 'high', assigneeId: 'u2', projectId: 'p3', labels: ['mobile', 'setup'], dueDate: '2026-02-10', createdAt: '2026-02-01', updatedAt: '2026-02-08', comments: [] },
  { id: 't5', title: 'Write auth migration scripts', description: 'Database migration scripts for new auth tables and SSO config.', status: 'backlog', priority: 'medium', assigneeId: 'u3', projectId: 'p5', labels: ['backend', 'database'], dueDate: '2026-03-01', createdAt: '2026-02-05', updatedAt: '2026-02-05', comments: [] },
  { id: 't6', title: 'Performance audit', description: 'Run Lighthouse and analyze bundle size. Target 90+ score.', status: 'todo', priority: 'medium', assigneeId: 'u2', projectId: 'p1', labels: ['frontend', 'performance'], dueDate: '2026-02-28', createdAt: '2026-02-06', updatedAt: '2026-02-06', comments: [] },
  { id: 't7', title: 'API rate limiting', description: 'Implement sliding window rate limiter for v3 API endpoints.', status: 'in_progress', priority: 'high', assigneeId: 'u3', projectId: 'p2', labels: ['backend', 'security'], dueDate: '2026-02-18', createdAt: '2026-02-02', updatedAt: '2026-02-10', comments: [] },
  { id: 't8', title: 'Design mobile onboarding', description: 'Create onboarding flow screens for first-time mobile users.', status: 'in_progress', priority: 'medium', assigneeId: 'u4', projectId: 'p3', labels: ['design', 'mobile'], dueDate: '2026-02-22', createdAt: '2026-02-04', updatedAt: '2026-02-09', comments: [] },
  { id: 't9', title: 'E2E test suite for auth', description: 'Write Cypress tests covering login, signup, password reset, and MFA flows.', status: 'backlog', priority: 'low', assigneeId: 'u6', projectId: 'p5', labels: ['testing', 'auth'], dueDate: '2026-03-15', createdAt: '2026-02-07', updatedAt: '2026-02-07', comments: [] },
  { id: 't10', title: 'Docker compose for local dev', description: 'Set up Docker compose with PostgreSQL, Redis, and the API server.', status: 'done', priority: 'medium', assigneeId: 'u5', projectId: 'p4', labels: ['devops', 'setup'], dueDate: '2026-01-30', createdAt: '2026-01-15', updatedAt: '2026-01-28', comments: [] },
  { id: 't11', title: 'Fix table sorting bug', description: 'Sorting by date column shows incorrect order for null values.', status: 'todo', priority: 'low', assigneeId: 'u2', projectId: 'p1', labels: ['bug', 'frontend'], dueDate: '2026-02-20', createdAt: '2026-02-08', updatedAt: '2026-02-08', comments: [] },
  { id: 't12', title: 'Implement search API', description: 'Full-text search endpoint with filtering and pagination support.', status: 'in_progress', priority: 'critical', assigneeId: 'u3', projectId: 'p2', labels: ['backend', 'search'], dueDate: '2026-02-16', createdAt: '2026-02-03', updatedAt: '2026-02-10', comments: [{ id: 'c3', authorId: 'u1', content: 'Use pg_trgm for fuzzy matching.', createdAt: '2026-02-07' }] },
  { id: 't13', title: 'Component library docs', description: 'Document all shared UI components with usage examples in Storybook.', status: 'backlog', priority: 'low', assigneeId: 'u4', projectId: 'p1', labels: ['documentation', 'design'], dueDate: '2026-03-10', createdAt: '2026-02-09', updatedAt: '2026-02-09', comments: [] },
  { id: 't14', title: 'Push notification service', description: 'Set up Firebase Cloud Messaging for mobile push notifications.', status: 'todo', priority: 'medium', assigneeId: 'u5', projectId: 'p3', labels: ['mobile', 'backend'], dueDate: '2026-03-05', createdAt: '2026-02-06', updatedAt: '2026-02-06', comments: [] },
  { id: 't15', title: 'Load testing', description: 'Run k6 load tests on critical v3 endpoints. Target: 1000 RPS.', status: 'backlog', priority: 'medium', assigneeId: 'u6', projectId: 'p2', labels: ['testing', 'performance'], dueDate: '2026-03-20', createdAt: '2026-02-10', updatedAt: '2026-02-10', comments: [] },
];

export const activities: Activity[] = [
  { id: 'a1', type: 'completed', userId: 'u5', taskId: 't10', description: 'completed "Docker compose for local dev"', createdAt: '2026-02-10T14:30:00' },
  { id: 'a2', type: 'commented', userId: 'u1', taskId: 't12', description: 'commented on "Implement search API"', createdAt: '2026-02-10T13:15:00' },
  { id: 'a3', type: 'updated', userId: 'u3', taskId: 't7', description: 'updated status of "API rate limiting" to In Progress', createdAt: '2026-02-10T11:45:00' },
  { id: 'a4', type: 'assigned', userId: 'u1', taskId: 't3', description: 'assigned "Migrate user endpoints" to Marcus', createdAt: '2026-02-10T10:00:00' },
  { id: 'a5', type: 'created', userId: 'u2', taskId: 't11', description: 'created "Fix table sorting bug"', createdAt: '2026-02-09T16:20:00' },
  { id: 'a6', type: 'updated', userId: 'u4', taskId: 't8', description: 'updated "Design mobile onboarding" priority to Medium', createdAt: '2026-02-09T14:00:00' },
  { id: 'a7', type: 'completed', userId: 'u2', taskId: 't4', description: 'completed "Set up React Native project"', createdAt: '2026-02-08T17:30:00' },
  { id: 'a8', type: 'commented', userId: 'u5', taskId: 't3', description: 'commented on "Migrate user endpoints"', createdAt: '2026-02-09T09:30:00' },
];

// Helper functions
export const getTeamMember = (id: string) => teamMembers.find(m => m.id === id);
export const getProject = (id: string) => projects.find(p => p.id === id);
export const getTasksByProject = (projectId: string) => tasks.filter(t => t.projectId === projectId);
export const getTasksByAssignee = (userId: string) => tasks.filter(t => t.assigneeId === userId);
export const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);
