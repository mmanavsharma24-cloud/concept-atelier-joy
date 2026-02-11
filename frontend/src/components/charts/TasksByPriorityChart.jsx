import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TasksByPriorityChart = ({ tasks }) => {
  const data = [
    {
      name: 'Critical',
      count: tasks.filter(t => t.priority === 'critical').length,
      fill: '#1E3A8A'
    },
    {
      name: 'High',
      count: tasks.filter(t => t.priority === 'high').length,
      fill: '#2D5A8C'
    },
    {
      name: 'Medium',
      count: tasks.filter(t => t.priority === 'medium').length,
      fill: '#3B82F6'
    },
    {
      name: 'Low',
      count: tasks.filter(t => t.priority === 'low').length,
      fill: '#60A5FA'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '2px solid #3B82F6',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#1E3A8A' }}>
            {payload[0].payload.name}
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
      <h3>Tasks by Priority</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart 
          data={data}
          margin={{ top: 15, right: 20, left: 0, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#1E3A8A', fontWeight: 600 }} />
          <YAxis tick={{ fontSize: 11, fill: '#7f8c8d' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TasksByPriorityChart;
