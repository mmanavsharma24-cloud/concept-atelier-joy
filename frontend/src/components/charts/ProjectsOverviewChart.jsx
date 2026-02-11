import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProjectsOverviewChart = ({ projects }) => {
  const data = [
    {
      name: 'Active',
      count: projects.filter(p => p.status === 'active').length,
      fill: '#60A5FA'
    },
    {
      name: 'In Progress',
      count: projects.filter(p => p.status === 'in_progress').length,
      fill: '#3B82F6'
    },
    {
      name: 'Planning',
      count: projects.filter(p => p.status === 'planning').length,
      fill: '#1E3A8A'
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
            Projects: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <h3>Projects Overview</h3>
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

export default ProjectsOverviewChart;
