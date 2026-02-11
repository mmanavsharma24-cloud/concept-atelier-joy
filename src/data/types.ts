export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  projectId: string;
  labels: string[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  memberIds: string[];
  dueDate: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'assigned' | 'completed';
  userId: string;
  taskId: string;
  description: string;
  createdAt: string;
}
