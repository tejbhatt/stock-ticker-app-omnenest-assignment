import React from 'react';
import styled from 'styled-components';
import type { PriceData } from '../Time-Window-Deque/Time-Window-Deque-LinkedList';

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f8fafc;
  border-radius: 4px;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #64748b;
  font-size: 0.875rem;
`;

interface ChartProps {
  prices: PriceData[];
  movingAverages: { value: number; timestamp: number }[];
}

export const Chart: React.FC<ChartProps> = ({ prices, movingAverages }) => {
   if (prices.length < 2 || movingAverages.length < 2) {
    return (
      <ChartContainer>
        <LoadingMessage>
          Collecting data... (minimum 2 points needed)
        </LoadingMessage>
      </ChartContainer>
    );
  }

  // Calculate viewBox dimensions
  const minTimestamp = prices[0].timestamp;
  const maxTimestamp = prices[prices.length - 1].timestamp;
  const allValues = [...prices.map(p => p.price), ...movingAverages.map(m => m.value)];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Normalize data to SVG coordinates
  const normalizeX = (timestamp: number) => 
    ((timestamp - minTimestamp) / (maxTimestamp - minTimestamp)) * 100;
  
  const normalizeY = (value: number) => 
    100 - ((value - minValue) / (maxValue - minValue)) * 100;

  // Generate path data
  const pricePath = prices.map(p => 
    `${normalizeX(p.timestamp)},${normalizeY(p.price)}`
  ).join(' ');

  const averagePath = movingAverages.map(m => 
    `${normalizeX(m.timestamp)},${normalizeY(m.value)}`
  ).join(' ');

  return (
    <ChartContainer>
      <ChartSVG viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Price line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.5"
          points={pricePath}
        />
        
        {/* Moving average line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          points={averagePath}
        />
        
        {/* Axes and legend */}
      </ChartSVG>
    </ChartContainer>
  );
};