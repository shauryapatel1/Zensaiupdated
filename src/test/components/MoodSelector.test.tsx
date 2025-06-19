import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import MoodSelector from '../../components/MoodSelector';
import { MoodLevel } from '../../types';
import { moods } from '../../data/moods';

describe('MoodSelector', () => {
  it('renders all mood options', () => {
    const mockOnMoodSelect = vi.fn();
    
    render(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
      />
    );
    
    // Check that all moods are rendered
    moods.forEach(mood => {
      expect(screen.getByText(mood.label)).toBeInTheDocument();
      expect(screen.getByText(mood.emoji)).toBeInTheDocument();
    });
  });
  
  it('shows selected mood', () => {
    const mockOnMoodSelect = vi.fn();
    const selectedMood: MoodLevel = 4; // Good
    
    render(
      <MoodSelector
        selectedMood={selectedMood}
        onMoodSelect={mockOnMoodSelect}
      />
    );
    
    // Check that the selected mood has the correct aria-checked state
    const selectedMoodButton = screen.getByRole('radio', { checked: true });
    expect(selectedMoodButton).toHaveTextContent(moods.find(m => m.level === selectedMood)?.label || '');
  });
  
  it('calls onMoodSelect when a mood is clicked', () => {
    const mockOnMoodSelect = vi.fn();
    
    render(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
      />
    );
    
    // Click on the "Good" mood
    const goodMood = screen.getByText('Good');
    fireEvent.click(goodMood);
    
    // Check that onMoodSelect was called with the correct mood level
    expect(mockOnMoodSelect).toHaveBeenCalledWith(4);
  });
  
  it('handles keyboard navigation', () => {
    const mockOnMoodSelect = vi.fn();
    
    render(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
      />
    );
    
    // Find all mood buttons
    const moodButtons = screen.getAllByRole('radio');
    
    // Press Enter key on the "Good" mood
    fireEvent.keyDown(moodButtons[3], { key: 'Enter' });
    expect(mockOnMoodSelect).toHaveBeenCalledWith(4);
    
    // Press Space key on the "Amazing" mood
    fireEvent.keyDown(moodButtons[4], { key: ' ' });
    expect(mockOnMoodSelect).toHaveBeenCalledWith(5);
  });
  
  it('respects disabled state', () => {
    const mockOnMoodSelect = vi.fn();
    
    render(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
        disabled={true}
      />
    );
    
    // Click on a mood
    const goodMood = screen.getByText('Good');
    fireEvent.click(goodMood);
    
    // onMoodSelect should not be called
    expect(mockOnMoodSelect).not.toHaveBeenCalled();
  });
  
  it('renders with different sizes', () => {
    const mockOnMoodSelect = vi.fn();
    
    const { rerender } = render(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
        size="sm"
      />
    );
    
    // Check small size
    let moodButtons = screen.getAllByRole('radio');
    expect(moodButtons[0]).toHaveClass('p-2');
    
    // Check medium size
    rerender(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
        size="md"
      />
    );
    
    moodButtons = screen.getAllByRole('radio');
    expect(moodButtons[0]).toHaveClass('p-3');
    
    // Check large size
    rerender(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
        size="lg"
      />
    );
    
    moodButtons = screen.getAllByRole('radio');
    expect(moodButtons[0]).toHaveClass('p-4');
  });
  
  it('renders with different layouts', () => {
    const mockOnMoodSelect = vi.fn();
    
    const { rerender } = render(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
        layout="horizontal"
      />
    );
    
    // Check horizontal layout
    let container = screen.getByRole('radiogroup');
    expect(container.firstChild).toHaveClass('flex');
    
    // Check grid layout
    rerender(
      <MoodSelector
        onMoodSelect={mockOnMoodSelect}
        layout="grid"
      />
    );
    
    container = screen.getByRole('radiogroup');
    expect(container.firstChild).toHaveClass('grid');
  });
});