

# Project Management Tool — Design Plan

## Overview
A professional, information-dense project management app for software teams, inspired by tools like Jira and Linear. Frontend-only with mock data — ready to connect a backend later.

---

## Pages & Layout

### Global Layout
- **Collapsible sidebar** with navigation: Dashboard, Projects, Board, Tasks, Team
- **Top header bar** with search, notifications bell, and user avatar
- Dense, compact spacing throughout — prioritizing information density

---

## 1. Dashboard (Home)
- **Summary cards**: Total projects, open tasks, overdue tasks, completed this week
- **Progress charts** (using Recharts): tasks by status, tasks by priority, burn-down style chart
- **Recent activity feed**: latest task updates, assignments, comments
- **My Tasks widget**: quick view of tasks assigned to you

## 2. Projects Page
- Table/list of all projects with columns: Name, Status, Progress bar, Team members (avatars), Due date
- Click a project to see its board and task list

## 3. Kanban Board
- Drag-and-drop columns: **Backlog → To Do → In Progress → In Review → Done**
- Task cards showing: title, priority badge, assignee avatar, due date, tag/label
- Quick-add task button per column
- Filter bar: by assignee, priority, label

## 4. Task List View
- Dense table view with sortable columns: Title, Status, Priority, Assignee, Due Date, Labels
- Inline status/priority dropdowns for quick editing
- Click a task row to open a **task detail panel** (slide-over sheet)

### Task Detail Panel
- Title, description, status, priority, assignee selector
- Due date picker
- Labels/tags
- Comments section (mock)
- Activity log

## 5. Team Page
- Team member cards/list: avatar, name, role, number of assigned tasks
- Workload overview: simple bar chart per member

---

## Design Approach
- **Color palette**: Muted, professional tones with color-coded priorities (red/orange/yellow/green/blue)
- **Typography**: Compact font sizes, medium weight headings
- **Components**: Heavy use of tables, badges, avatars, dropdowns, and cards
- **Dark mode support** included
- All data will be **realistic mock data** (sample projects, tasks, team members)

