import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TasksByAssigneeChart = ({ tasks, users }) => {
  const assigneeData = users.map(user => {
    const firstName = user.full_name.split(' ')[0];
    const lastName = user.full_name.split(' ')[1];
    const initials = firstName.charAt(0) + (lastName ? lastName.charAt(0) : '');
    
    return {
      name: initials.toUpperCase(),
      fullName: user.full_name,
      tasks: tasks.filter(t => t.assigned_to === user.id).length
    };
  }).filter(item => item.tasks > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = assigneeData.find(d => d.name === payload[0].payload.name);
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '2px solid #3B82F6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#1E3A8A' }}>
            {item?.fullName}
          </p>
          <p style={{ margin: 0, color: '#3B82F6', fontWeight: '600' }}>
            Tasks: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3>Tasks by Assignee</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart 
          data={assigneeData}
          margin={{ top: 15, right: 20, left: 0, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fontWeight: 600, fill: '#1E3A8A' }}
          />
          <YAxis tick={{ fontSize: 11, fill: '#7f8c8d' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="tasks" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasksByAssigneeChart;
