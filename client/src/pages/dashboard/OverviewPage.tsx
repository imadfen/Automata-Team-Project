import React from 'react';
import styled from '@emotion/styled';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// Styled components
const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  max-width: 1800px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  background-color: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 8px;
    height: 100%;
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;
  }
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 2rem;
  
  @media (max-width: 1280px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid #f1f5f9;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  &:nth-of-type(3) {
    grid-column: span 2;
    
    @media (max-width: 1280px) {
      grid-column: span 1;
    }
  }
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
    border-radius: 2px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
`;

const StatCard = styled.div<{ accent?: string }>`
  background-color: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #f1f5f9;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  grid-column: span 3;
  
  @media (max-width: 1280px) {
    grid-column: span 6;
  }
  
  @media (max-width: 768px) {
    grid-column: span 12;
  }
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accent || '#3b82f6'};
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
`;

// Sample data for charts
const pieData = [
  { name: 'Electronics', value: 400 },
  { name: 'Food', value: 300 },
  { name: 'Clothing', value: 300 },
  { name: 'Books', value: 200 },
];

const lineData = [
  { name: 'Jan', orders: 4000, items: 2400 },
  { name: 'Feb', orders: 3000, items: 1398 },
  { name: 'Mar', orders: 2000, items: 9800 },
  { name: 'Apr', orders: 2780, items: 3908 },
  { name: 'May', orders: 1890, items: 4800 },
  { name: 'Jun', orders: 2390, items: 3800 },
  { name: 'Jul', orders: 3490, items: 4300 },
];

const barData = [
  { name: 'Mon', tasks: 20 },
  { name: 'Tue', tasks: 15 },
  { name: 'Wed', tasks: 30 },
  { name: 'Thu', tasks: 22 },
  { name: 'Fri', tasks: 18 },
  { name: 'Sat', tasks: 5 },
  { name: 'Sun', tasks: 2 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

const OverviewPage: React.FC = () => {
  return (
    <Container>
      <WelcomeSection>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Automata System</h1>
        <p className="text-gray-600 max-w-3xl">
          Your comprehensive dashboard for warehouse automation and inventory management. 
          Here's an overview of your current operations and statistics.
        </p>
      </WelcomeSection>

      <StatsGrid>
        <StatCard accent="#3b82f6">
          <StatTitle>Total Products</StatTitle>
          <StatValue>1,286</StatValue>
        </StatCard>
        <StatCard accent="#8b5cf6">
          <StatTitle>Active Orders</StatTitle>
          <StatValue>38</StatValue>
        </StatCard>
        <StatCard accent="#ec4899">
          <StatTitle>Automated Tasks</StatTitle>
          <StatValue>127</StatValue>
        </StatCard>
        <StatCard accent="#f59e0b">
          <StatTitle>Connected Devices</StatTitle>
          <StatValue>12</StatValue>
        </StatCard>
      </StatsGrid>

      <ChartsContainer>
        <ChartCard>
          <ChartTitle>Inventory Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Order & Item Trends</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={lineData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="items" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Weekly Task Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsContainer>
    </Container>
  );
};

export default OverviewPage; 