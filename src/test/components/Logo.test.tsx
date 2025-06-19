import { describe, it, expect } from 'vitest';
import { render, screen } from '../utils';
import Logo from '../../components/Logo';
import { APP_NAME } from '../../constants/uiStrings';

describe('Logo', () => {
  it('renders with default props', () => {
    render(<Logo />);
    
    // Check that the logo image is rendered
    const logoImage = screen.getByAltText(`${APP_NAME} fox logo`);
    expect(logoImage).toBeInTheDocument();
    
    // Check that the container has the correct classes for medium size
    const logoContainer = screen.getByRole('img', { name: `${APP_NAME} logo` });
    expect(logoContainer).toHaveClass('w-12 h-12');
  });
  
  it('renders with small size', () => {
    render(<Logo size="sm" />);
    
    const logoContainer = screen.getByRole('img', { name: `${APP_NAME} logo` });
    expect(logoContainer).toHaveClass('w-10 h-10');
  });
  
  it('renders with large size', () => {
    render(<Logo size="lg" />);
    
    const logoContainer = screen.getByRole('img', { name: `${APP_NAME} logo` });
    expect(logoContainer).toHaveClass('w-16 h-16');
  });
  
  it('renders with custom class name', () => {
    render(<Logo className="custom-class" />);
    
    const logoContainer = screen.getByRole('img', { name: `${APP_NAME} logo` });
    expect(logoContainer).toHaveClass('custom-class');
  });
  
  it('renders without animation when animate is false', () => {
    render(<Logo animate={false} />);
    
    // When animate is false, it should render a div instead of motion.div
    const logoContainer = screen.getByRole('img', { name: `${APP_NAME} logo` });
    expect(logoContainer.tagName).toBe('DIV');
  });
});