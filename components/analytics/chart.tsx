'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  count: number;
}

interface ChartProps {
  data: ChartData[];
}

export default function Chart({ data }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">No data available for chart</div>;
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={80} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="count" 
            fill="#3b82f6" 
            name="Times Used" 
            radius={[4, 4, 0, 0]}
            className="transition-opacity hover:opacity-80" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
