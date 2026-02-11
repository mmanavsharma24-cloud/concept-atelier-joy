import { projects, teamMembers, getTasksByProject } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statusBadge: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  archived: 'bg-muted text-muted-foreground',
};

export default function Projects() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Projects</h1>
        <span className="text-xs text-muted-foreground">{projects.length} projects</span>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Progress</TableHead>
                <TableHead className="text-xs">Team</TableHead>
                <TableHead className="text-xs">Tasks</TableHead>
                <TableHead className="text-xs">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(p => {
                const members = p.memberIds.map(id => teamMembers.find(m => m.id === id)!).filter(Boolean);
                const taskCount = getTasksByProject(p.id).length;
                return (
                  <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="py-2.5">
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 capitalize ${statusBadge[p.status]}`}>
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={p.progress} className="h-1.5 flex-1" />
                        <span className="text-[11px] text-muted-foreground w-7">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex -space-x-1.5">
                        {members.slice(0, 3).map(m => (
                          <Avatar key={m.id} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-[8px] bg-muted">{m.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                        ))}
                        {members.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] text-muted-foreground">+{members.length - 3}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{taskCount}</TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
