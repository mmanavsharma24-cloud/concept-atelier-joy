import { useState } from 'react';
import { tasks as allTasks, getTeamMember, teamMembers } from '@/data/mockData';
import { Task, TaskStatus } from '@/data/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-gray-400' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { id: 'in_review', label: 'In Review', color: 'bg-purple-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
];

const priorityMap: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>(allTasks);
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const filtered = tasks.filter(t => {
    if (filterAssignee !== 'all' && t.assigneeId !== filterAssignee) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (status: TaskStatus) => {
    if (!draggedTask) return;
    setTasks(prev => prev.map(t => t.id === draggedTask ? { ...t, status } : t));
    setDraggedTask(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Board</h1>
        <div className="flex items-center gap-2">
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="h-7 text-xs w-32"><SelectValue placeholder="Assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {teamMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map(col => {
          const colTasks = filtered.filter(t => t.status === col.id);
          return (
            <div
              key={col.id}
              className="flex min-w-[240px] flex-1 flex-col rounded-lg bg-muted/50 border"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center gap-2 px-3 py-2 border-b">
                <div className={`h-2 w-2 rounded-full ${col.color}`} />
                <span className="text-xs font-medium">{col.label}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{colTasks.length}</span>
              </div>
              <div className="flex-1 space-y-2 p-2 min-h-[200px]">
                {colTasks.map(task => {
                  const assignee = getTeamMember(task.assigneeId);
                  return (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className="cursor-grab active:cursor-grabbing p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="text-xs font-medium leading-tight">{task.title}</div>
                        <div className="flex flex-wrap gap-1">
                          {task.labels.map(l => (
                            <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{l}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className={`text-[9px] px-1 py-0 ${priorityMap[task.priority]}`}>
                            {task.priority}
                          </Badge>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[8px] bg-muted">{assignee?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <div className="p-2 border-t">
                <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-muted-foreground">
                  <Plus className="h-3 w-3 mr-1" /> Add task
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
