import { useState } from 'react';
import { tasks as allTasks, getTeamMember, teamMembers, getProject } from '@/data/mockData';
import { Task } from '@/data/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const priorityMap: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const statusMap: Record<string, string> = {
  backlog: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  todo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

type SortKey = 'title' | 'status' | 'priority' | 'dueDate';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...allTasks].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortKey === 'priority') cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
    else cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortHeader = ({ label, sKey }: { label: string; sKey: SortKey }) => (
    <TableHead className="text-xs cursor-pointer select-none hover:text-foreground" onClick={() => handleSort(sKey)}>
      {label} {sortKey === sKey ? (sortAsc ? '↑' : '↓') : ''}
    </TableHead>
  );

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold">Tasks</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader label="Title" sKey="title" />
                <SortHeader label="Status" sKey="status" />
                <SortHeader label="Priority" sKey="priority" />
                <TableHead className="text-xs">Assignee</TableHead>
                <SortHeader label="Due Date" sKey="dueDate" />
                <TableHead className="text-xs">Labels</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(t => {
                const assignee = getTeamMember(t.assigneeId);
                return (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTask(t)}>
                    <TableCell className="py-2 text-sm font-medium">{t.title}</TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 capitalize ${statusMap[t.status]}`}>
                        {t.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 capitalize ${priorityMap[t.priority]}`}>
                        {t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[8px] bg-muted">{assignee?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{assignee?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1">
                        {t.labels.map(l => (
                          <span key={l} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{l}</span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedTask && <TaskDetail task={selectedTask} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TaskDetail({ task }: { task: Task }) {
  const assignee = getTeamMember(task.assigneeId);
  const project = getProject(task.projectId);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-base">{task.title}</SheetTitle>
        <SheetDescription className="text-xs">{project?.name}</SheetDescription>
      </SheetHeader>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</label>
            <Badge variant="secondary" className={`mt-1 text-[10px] px-1.5 py-0 capitalize ${statusMap[task.status]}`}>
              {task.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Priority</label>
            <Badge variant="secondary" className={`mt-1 text-[10px] px-1.5 py-0 capitalize ${priorityMap[task.priority]}`}>
              {task.priority}
            </Badge>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Assignee</label>
            <div className="flex items-center gap-1.5 mt-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[8px] bg-muted">{assignee?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{assignee?.name}</span>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Due Date</label>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Description</label>
          <p className="mt-1 text-sm text-foreground/80">{task.description}</p>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Labels</label>
          <div className="flex gap-1 mt-1">
            {task.labels.map(l => (
              <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{l}</span>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Comments ({task.comments.length})
          </label>
          <div className="mt-2 space-y-2">
            {task.comments.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
            {task.comments.map(c => {
              const author = getTeamMember(c.authorId);
              return (
                <div key={c.id} className="rounded border p-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[7px] bg-muted">{author?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-medium">{author?.name}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-foreground/80">{c.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
