import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TradingPlatform from './trading-platform';

// Mock the PriceTicker component since we're testing TradingPlatform in isolation
jest.mock('../Price-Ticker/Price-Ticker', () => {
  return function MockPriceTicker({ symbol, name, active, onClick }: any) {
    return (
      <div 
        data-testid={`ticker-${symbol}`}
        data-active={active}
        onClick={onClick}
      >
        {symbol} - {name}
      </div>
    );
  };
});

describe('TradingPlatform', () => {
  const mockWatchlist = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the header with correct title and subtitle', () => {
    render(<TradingPlatform />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Stock Ticker UI');
    expect(screen.getByText('Real-time 30s Moving Averages')).toBeInTheDocument();
  });

  it('renders the watchlist sidebar with default stocks', () => {
    render(<TradingPlatform />);
    
    // Check if watchlist items are rendered
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    
    // Check for some default stocks
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('MSFT')).toBeInTheDocument();
    expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
  });

  it('highlights the selected symbol in the watchlist', () => {
    render(<TradingPlatform />);
    
    // The first item should be selected by default (AAPL)
    const aaplItem = screen.getByText('AAPL').closest('div[role="button"]');
    const msftItem = screen.getByText('MSFT').closest('div[role="button"]');
    
    // Check if AAPL is selected by default
    expect(aaplItem).toHaveStyle('background-color: rgb(224, 231, 255)');
    expect(msftItem).not.toHaveStyle('background-color: rgb(224, 231, 255)');
    
    // Click on MSFT
    fireEvent.click(msftItem!);
    
    // Now MSFT should be selected
    expect(msftItem).toHaveStyle('background-color: rgb(224, 231, 255)');
    expect(aaplItem).not.toHaveStyle('background-color: rgb(224, 231, 255)');
  });

  it('renders price tickers for all watchlist items', () => {
    render(<TradingPlatform />);
    
    // Check if tickers are rendered for all watchlist items
    mockWatchlist.forEach(stock => {
      expect(screen.getByTestId(`ticker-${stock.symbol}`)).toBeInTheDocument();
    });
  });

  it('updates the selected symbol when a ticker is clicked', () => {
    render(<TradingPlatform />);
    
    // Get the MSFT ticker and click it
    const msftTicker = screen.getByTestId('ticker-MSFT');
    fireEvent.click(msftTicker);
    
    // The ticker should now be active
    expect(msftTicker).toHaveAttribute('data-active', 'true');
    
    // The MSFT watchlist item should now be selected
    const msftItem = screen.getByText('MSFT').closest('div[role="button"]');
    expect(msftItem).toHaveStyle('background-color: rgb(224, 231, 255)');
  });

  it('displays the correct heading and info text', () => {
    render(<TradingPlatform />);
    
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Price Tickers');
    expect(screen.getByText('Click a ticker to view its chart')).toBeInTheDocument();
  });
});
