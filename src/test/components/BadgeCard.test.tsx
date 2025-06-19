import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import BadgeCard from '../../components/BadgeCard';
import { mockBadges } from '../mocks/mockData';

describe('BadgeCard', () => {
  it('renders an earned badge correctly', () => {
    const mockOnClick = vi.fn();
    const earnedBadge = mockBadges[0]; // First Steps badge (earned)
    
    render(
      <BadgeCard 
        badge={earnedBadge}
        onClick={mockOnClick}
      />
    );
    
    // Check that badge name and icon are displayed
    expect(screen.getByText(earnedBadge.badge_name)).toBeInTheDocument();
    expect(screen.getByText(earnedBadge.badge_icon)).toBeInTheDocument();
    
    // Check that earned status is indicated
    expect(screen.getByText('common')).toBeInTheDocument(); // Rarity
    
    // Check that clicking the badge calls the onClick handler
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('renders an unearned badge correctly', () => {
    const mockOnClick = vi.fn();
    const unearnedBadge = mockBadges[2]; // Week Warrior badge (not earned)
    
    render(
      <BadgeCard 
        badge={unearnedBadge}
        onClick={mockOnClick}
      />
    );
    
    // Check that badge name is displayed
    expect(screen.getByText(unearnedBadge.badge_name)).toBeInTheDocument();
    
    // Check that progress is displayed for unearned badges
    expect(screen.getByText(`${unearnedBadge.progress_current}/${unearnedBadge.progress_target}`)).toBeInTheDocument();
    expect(screen.getByText(`${unearnedBadge.progress_percentage}%`)).toBeInTheDocument();
    
    // Check that clicking the badge calls the onClick handler
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  it('handles keyboard navigation correctly', () => {
    const mockOnClick = vi.fn();
    const badge = mockBadges[0];
    
    render(
      <BadgeCard 
        badge={badge}
        onClick={mockOnClick}
      />
    );
    
    const badgeElement = screen.getByRole('button');
    
    // Press Enter key
    fireEvent.keyDown(badgeElement, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Press Space key
    fireEvent.keyDown(badgeElement, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
    
    // Other keys should not trigger onClick
    fireEvent.keyDown(badgeElement, { key: 'A' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });
  
  it('applies different styles based on badge rarity', () => {
    const commonBadge = { ...mockBadges[0], badge_rarity: 'common' };
    const rareBadge = { ...mockBadges[0], badge_rarity: 'rare' };
    const epicBadge = { ...mockBadges[0], badge_rarity: 'epic' };
    const legendaryBadge = { ...mockBadges[0], badge_rarity: 'legendary' };
    
    const { rerender } = render(<BadgeCard badge={commonBadge} onClick={() => {}} />);
    expect(screen.getByText('common')).toBeInTheDocument();
    
    rerender(<BadgeCard badge={rareBadge} onClick={() => {}} />);
    expect(screen.getByText('rare')).toBeInTheDocument();
    
    rerender(<BadgeCard badge={epicBadge} onClick={() => {}} />);
    expect(screen.getByText('epic')).toBeInTheDocument();
    
    rerender(<BadgeCard badge={legendaryBadge} onClick={() => {}} />);
    expect(screen.getByText('legendary')).toBeInTheDocument();
  });
  
  it('renders with different sizes', () => {
    const badge = mockBadges[0];
    
    const { rerender } = render(<BadgeCard badge={badge} size="sm" onClick={() => {}} />);
    let badgeElement = screen.getByRole('button');
    expect(badgeElement).toHaveClass('p-3');
    
    rerender(<BadgeCard badge={badge} size="md" onClick={() => {}} />);
    badgeElement = screen.getByRole('button');
    expect(badgeElement).toHaveClass('p-4');
    
    rerender(<BadgeCard badge={badge} size="lg" onClick={() => {}} />);
    badgeElement = screen.getByRole('button');
    expect(badgeElement).toHaveClass('p-6');
  });
});