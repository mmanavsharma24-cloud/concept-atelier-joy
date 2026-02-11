import { teamMembers, getTasksByAssignee } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Team() {
  const workloadData = teamMembers.map(m => ({
    name: m.name.split(' ')[0],
    tasks: getTasksByAssignee(m.id).length,
    open: getTasksByAssignee(m.id).filter(t => t.status !== 'done').length,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Team</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teamMembers.map(m => {
          const memberTasks = getTasksByAssignee(m.id);
          const openTasks = memberTasks.filter(t => t.status !== 'done').length;
          return (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.role}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{memberTasks.length} tasks</Badge>
                  <Badge variant="secondary" className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">{openTasks} open</Badge>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground">{m.email}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workload Overview</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workloadData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="tasks" fill="hsl(210, 70%, 55%)" radius={[3, 3, 0, 0]} name="Total" />
              <Bar dataKey="open" fill="hsl(45, 85%, 50%)" radius={[3, 3, 0, 0]} name="Open" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
