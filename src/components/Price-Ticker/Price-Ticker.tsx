import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { TimeWindowDeque } from '../Time-Window-Deque/Time-Window-Deque';

const TickerCard = styled.div<{ trend: 'up' | 'down' | 'neutral' }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background-color: white;
  transition: all 0.2s ease;
  border-top: 3px solid
    ${props =>
      props.trend === 'up'
        ? '#10b981'
        : props.trend === 'down'
        ? '#ef4444'
        : '#64748b'};
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;



const PriceValue = styled.span<{ trend: 'up' | 'down' | 'neutral' }>`
  font-family: 'Roboto Mono', monospace;
  font-size: 1.125rem;
  font-weight: 500;
  color: ${props =>
    props.trend === 'up'
      ? '#10b981'
      : props.trend === 'down'
      ? '#ef4444'
      : '#334155'};
`;

const TickerContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TickerInfo = styled.div`
  flex: 1;
`;

const TickerSymbol = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
`;

const TickerName = styled.p`
  margin: 0 0 4px 0;
  font-size: 0.875rem;
  color: #64748b;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
`;

const PriceLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
`;

const SampleColumn = styled.div`
  grid-column: 2;
  grid-row: 1 / span 2;
`;



const SampleList = styled.div`
  max-height: 80px;
  overflow-y: auto;
  font-size: 0.75rem;
  font-family: 'Roboto Mono', monospace;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 4px;
`;

const SampleItem = styled.div<{ isLatest?: boolean }>`
  padding: 2px 0;
  ${props => props.isLatest && 'font-weight: 600;'}
`;

export interface PriceTickerProps {
  symbol: string;
  name: string;
  active?: boolean;  
  onClick?: () => void;
}

export const PriceTicker: React.FC<PriceTickerProps> = React.memo(
  ({ symbol, name, active = false,onClick }) => {
    const dequeRef = useRef(new TimeWindowDeque());
    const wsRef = useRef<number | null>(null);
    const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');

    const updateMetrics = useCallback((newPrice: number) => {
      const now = Date.now();
      const cutoff = now - 30000;

      const prevPrice = dequeRef.current.getLatestPrice();
      if (prevPrice !== null) {
        setTrend(
          newPrice > prevPrice
            ? 'up'
            : newPrice < prevPrice
            ? 'down'
            : 'neutral'
        );
      }

      dequeRef.current.push(newPrice, now);
      dequeRef.current.expire(cutoff);
    }, []);

   useEffect(() => {
  let isMounted = true;

  const simulateWebSocket = () => {
    if (!isMounted) return;

    const lastPrice = dequeRef.current.getLatestPrice();
    const basePrice = lastPrice ?? 100;

    // Simulate price movement: ±0.5% of base price
    const delta = basePrice * ((Math.random() - 0.5) / 100); 
    const newPrice = Math.max(1, parseFloat((basePrice + delta).toFixed(2)));

    updateMetrics(newPrice);

    // Fixed delay: 1 tick every 1000ms
    wsRef.current = window.setTimeout(simulateWebSocket, 1000);
  };

  simulateWebSocket();

  return () => {
    isMounted = false;
    if (wsRef.current) clearTimeout(wsRef.current);
  };
}, [updateMetrics]);


    const latestPrice = dequeRef.current.getLatestPrice();
    const movingAvg = dequeRef.current.getAverage();
    const prices = dequeRef.current.getValues();

    return (
      <TickerCard trend={trend} onClick={onClick} style={{
          borderColor: active ? '#3b82f6' : '#e2e8f0',  
          boxShadow: active ? '0 0 0 2px #bfdbfe' : 'none'
        }} aria-label={`${symbol} price ticker`}>
        <div>
         {movingAvg !== null && (
  <div style={{
    fontSize: '0.75rem',
    color: '#3b82f6',
    fontWeight: 600,
    marginBottom: '6px'
  }}>
    30s Avg: {movingAvg.toFixed(2)}
  </div>
)}


          <TickerContent>
            <TickerInfo>
              <TickerSymbol>{symbol}</TickerSymbol>
              <TickerName>{name}</TickerName>
              <PriceContainer>
                <PriceLabel>Latest Price</PriceLabel>
                <PriceValue trend={trend}>
                  {latestPrice?.toFixed(2) ?? '--'}
                </PriceValue>
              </PriceContainer>
            </TickerInfo>
          </TickerContent>
        </div>

        <SampleColumn>
          <div> prices recevied within last 30 secs</div>
          <SampleList>
           
            {prices.map((price, index) => (
              <SampleItem 
                key={index}
                isLatest={index === prices.length - 1}
              >
                {price.toFixed(2)}
              </SampleItem>
            ))}
          </SampleList>
        </SampleColumn>
      </TickerCard>
    );
  }
);

PriceTicker.displayName = 'PriceTicker';