
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriceTicker } from './Price-Ticker';

// Mock the TimeWindowDeque to control its behavior in tests
jest.mock('../Time-Window-Deque/Time-Window-Deque', () => {
  return {
    TimeWindowDeque: jest.fn().mockImplementation(() => ({
      push: jest.fn(),
      expire: jest.fn(),
      getLatestPrice: jest.fn(),
      getAverage: jest.fn(),
      getValues: jest.fn(),
    })),
  };
});

describe('PriceTicker', () => {
  const mockProps = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PriceTicker {...mockProps} />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Latest Price')).toBeInTheDocument();
    expect(screen.getByText('prices recevied within last 30 secs')).toBeInTheDocument();
  });

  it('displays the latest price when available', () => {
    // Mock getLatestPrice to return a specific value
    const mockGetLatestPrice = jest.fn().mockReturnValue(150.25);
    require('../Time-Window-Deque/Time-Window-Deque').TimeWindowDeque
      .mockImplementationOnce(() => ({
        push: jest.fn(),
        expire: jest.fn(),
        getLatestPrice: mockGetLatestPrice,
        getAverage: jest.fn().mockReturnValue(149.50),
        getValues: jest.fn().mockReturnValue([149.00, 150.25]),
      }));

    render(<PriceTicker {...mockProps} />);
    
    expect(screen.getByText('150.25')).toBeInTheDocument();
    expect(screen.getByText('30s Avg: 149.50')).toBeInTheDocument();
  });

  it('shows neutral trend when price is stable', () => {
    const mockGetLatestPrice = jest.fn().mockReturnValue(150.00);
    require('../Time-Window-Deque/Time-Window-Deque').TimeWindowDeque
      .mockImplementationOnce(() => ({
        push: jest.fn(),
        expire: jest.fn(),
        getLatestPrice: mockGetLatestPrice,
        getAverage: jest.fn().mockReturnValue(150.00),
        getValues: jest.fn().mockReturnValue([150.00]),
      }));

    render(<PriceTicker {...mockProps} />);
    
    const priceElement = screen.getByText('150.00');
    expect(priceElement).toHaveStyle('color: #334155'); // neutral color
  });

  it('applies active styles when active prop is true', () => {
    render(<PriceTicker {...mockProps} active={true} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveStyle('border-color: #3b82f6');
    expect(card).toHaveStyle('box-shadow: 0 0 0 2px #bfdbfe');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<PriceTicker {...mockProps} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays price history correctly', () => {
    const mockPrices = [149.00, 150.25, 151.50];
    require('../Time-Window-Deque/Time-Window-Deque').TimeWindowDeque
      .mockImplementationOnce(() => ({
        push: jest.fn(),
        expire: jest.fn(),
        getLatestPrice: jest.fn().mockReturnValue(151.50),
        getAverage: jest.fn().mockReturnValue(150.25),
        getValues: jest.fn().mockReturnValue(mockPrices),
      }));

    render(<PriceTicker {...mockProps} />);
    
    mockPrices.forEach(price => {
      expect(screen.getByText(price.toFixed(2))).toBeInTheDocument();
    });
  });
});
