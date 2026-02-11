import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { tasks, projects, activities, teamMembers, getTeamMember } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, FolderOpen, ArrowUpRight } from 'lucide-react';

const statusColors: Record<string, string> = {
  backlog: 'hsl(var(--muted-foreground))',
  todo: 'hsl(210, 70%, 55%)',
  in_progress: 'hsl(45, 85%, 50%)',
  in_review: 'hsl(270, 60%, 55%)',
  done: 'hsl(145, 60%, 42%)',
};

const priorityMap: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const statusData = [
  { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length },
  { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
  { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
  { name: 'In Review', value: tasks.filter(t => t.status === 'in_review').length },
  { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
];

const pieColors = [statusColors.backlog, statusColors.todo, statusColors.in_progress, statusColors.in_review, statusColors.done];

const burndownData = [
  { day: 'Mon', remaining: 14, completed: 1 },
  { day: 'Tue', remaining: 13, completed: 2 },
  { day: 'Wed', remaining: 12, completed: 3 },
  { day: 'Thu', remaining: 10, completed: 5 },
  { day: 'Fri', remaining: 8, completed: 7 },
];

const overdue = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date());
const myTasks = tasks.filter(t => t.assigneeId === 'u1' || t.assigneeId === 'u2').slice(0, 5);

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={<FolderOpen className="h-4 w-4" />} label="Projects" value={projects.length} accent="text-primary" />
        <SummaryCard icon={<Clock className="h-4 w-4" />} label="Open Tasks" value={tasks.filter(t => t.status !== 'done').length} accent="text-blue-500" />
        <SummaryCard icon={<AlertTriangle className="h-4 w-4" />} label="Overdue" value={overdue.length} accent="text-destructive" />
        <SummaryCard icon={<CheckCircle2 className="h-4 w-4" />} label="Done This Week" value={tasks.filter(t => t.status === 'done').length} accent="text-green-500" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-1">
          <CardHeader className="py-3 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasks by Status</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-1">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tasks by Priority</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Critical', count: tasks.filter(t => t.priority === 'critical').length },
                { name: 'High', count: tasks.filter(t => t.priority === 'high').length },
                { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length },
                { name: 'Low', count: tasks.filter(t => t.priority === 'low').length },
              ]} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  <Cell fill="hsl(0, 70%, 55%)" />
                  <Cell fill="hsl(25, 85%, 55%)" />
                  <Cell fill="hsl(45, 85%, 50%)" />
                  <Cell fill="hsl(210, 70%, 55%)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Burndown</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={burndownData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="remaining" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="hsl(145, 60%, 42%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Activity + My Tasks */}
      <div className="grid lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Activity</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-2">
              {activities.slice(0, 6).map(a => {
                const user = getTeamMember(a.userId);
                return (
                  <div key={a.id} className="flex items-start gap-2 text-xs">
                    <Avatar className="h-5 w-5 mt-0.5 shrink-0">
                      <AvatarFallback className="text-[8px] bg-muted">{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <span className="font-medium">{user?.name}</span>{' '}
                      <span className="text-muted-foreground">{a.description}</span>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-4"><CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">My Tasks</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-1.5">
              {myTasks.map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: statusColors[t.status] }} />
                    <span className="truncate font-medium">{t.title}</span>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 shrink-0 ${priorityMap[t.priority]}`}>
                    {t.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`${accent}`}>{icon}</div>
          <ArrowUpRight className="h-3 w-3 text-muted-foreground/40" />
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
        <div className="text-[11px] text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}
