import React, { useState } from 'react';
import styled from 'styled-components';
import { PriceTicker } from '../Price-Ticker/Price-Ticker';

export interface StockSymbol {
  symbol: string;
  name: string;
  price?: number;         // Optional current price
  change?: number;        // Optional price change
  changePercent?: number; // Optional percentage change
  sector?: string;        // Optional sector information
}

// Styled Components
const TradingPlatformContainer = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  grid-template-rows: 60px 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, sans-serif;
  background-color: #ffffff;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 60px auto 1fr auto;
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "footer";
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: #1e3a8a;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;

  h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
`;

const Sidebar = styled.aside`
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 16px;
  overflow-y: auto;
  grid-area: sidebar;
  min-height: 0; /* Allow sidebar to shrink if needed */
  overflow-y: auto; /* Add scroll if content is too long */
  
  @media (max-width: 768px) {
    min-height: auto;
  }

  h3 {
    margin: 0 0 16px 0;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
  }
`;

const WatchlistItem = styled.div<{ active?: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? '#e0e7ff' : 'transparent'};
  color: ${props => props.active ? '#1e3a8a' : '#334155'};

  &:hover {
    background-color: ${props => props.active ? '#e0e7ff' : '#f1f5f9'};
  }

  .symbol {
    font-weight: ${props => props.active ? '600' : '500'};
    margin-bottom: 2px;
  }

  .name {
    font-size: 0.75rem;
    color: ${props => props.active ? '#1e3a8a' : '#64748b'};
  }
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  grid-area: main;
  min-height: 0; /* Allow main content to shrink if needed */
  overflow-y: auto; /* Add scroll if content is too long */

  @media (max-width: 768px) {
    min-height: auto;
  }
`;

const TickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
  }
`;

const TickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;






const TradingPlatform: React.FC = () => {
  const [watchlist] = useState<StockSymbol[]>([
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  ]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');

  return (
    <TradingPlatformContainer>
      <Header>
        <h1>Stock Ticker UI</h1>
        <HeaderInfo>
          <span>Real-time 30s Moving Averages</span>
        </HeaderInfo>
      </Header>

      <Sidebar>
        <h3>Watchlist</h3>
        {watchlist.map(stock => (
          <WatchlistItem 
            key={stock.symbol}
            active={selectedSymbol === stock.symbol}
            onClick={() => setSelectedSymbol(stock.symbol)}
            aria-label={`Select ${stock.symbol}`}
          >
            <div className="symbol">{stock.symbol}</div>
            <div className="name">{stock.name}</div>
          </WatchlistItem>
        ))}
      </Sidebar>

      <MainContent>
        <TickerHeader>
          <h2>Price Tickers</h2>
        </TickerHeader>
        
        <TickerGrid>
          {watchlist.map(stock => (
            <PriceTicker
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              active={selectedSymbol === stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
            />
          ))}
        </TickerGrid>

      
      </MainContent>
      
    </TradingPlatformContainer>
  );
};

export default TradingPlatform;