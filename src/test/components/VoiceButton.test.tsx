import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import VoiceButton from '../../components/VoiceButton';

describe('VoiceButton', () => {
  it('renders correctly when not playing or generating', () => {
    const mockPlay = vi.fn();
    const mockStop = vi.fn();
    
    render(
      <VoiceButton
        isGenerating={false}
        isPlaying={false}
        onPlay={mockPlay}
        onStop={mockStop}
      />
    );
    
    // Should show play button
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Play speech');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    
    // Click should trigger play
    fireEvent.click(button);
    expect(mockPlay).toHaveBeenCalledTimes(1);
    expect(mockStop).not.toHaveBeenCalled();
  });
  
  it('handles playing state correctly', () => {
    const mockPlay = vi.fn();
    const mockStop = vi.fn();
    
    render(
      <VoiceButton
        isGenerating={false}
        isPlaying={true}
        onPlay={mockPlay}
        onStop={mockStop}
      />
    );
    
    // Should show stop button
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Stop speech');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    
    // Click should trigger stop
    fireEvent.click(button);
    expect(mockStop).toHaveBeenCalledTimes(1);
    expect(mockPlay).not.toHaveBeenCalled();
  });
  
  it('handles generating state correctly', () => {
    const mockPlay = vi.fn();
    const mockStop = vi.fn();
    
    render(
      <VoiceButton
        isGenerating={true}
        isPlaying={false}
        onPlay={mockPlay}
        onStop={mockStop}
      />
    );
    
    // Should show loading state and be disabled
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Generating speech...');
    expect(button).toBeDisabled();
    
    // Click should not trigger anything
    fireEvent.click(button);
    expect(mockPlay).not.toHaveBeenCalled();
    expect(mockStop).not.toHaveBeenCalled();
  });
  
  it('shows premium upsell for non-premium users', () => {
    const mockPlay = vi.fn();
    const mockStop = vi.fn();
    const mockUpsell = vi.fn();
    
    render(
      <VoiceButton
        isPremiumUser={false}
        onUpsellTrigger={mockUpsell}
        isGenerating={false}
        isPlaying={false}
        onPlay={mockPlay}
        onStop={mockStop}
      />
    );
    
    // Should have premium feature tooltip
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Premium feature - Upgrade to unlock');
    
    // Click should trigger upsell
    fireEvent.click(button);
    expect(mockUpsell).toHaveBeenCalledTimes(1);
    expect(mockPlay).not.toHaveBeenCalled();
  });
  
  it('renders with different sizes', () => {
    const { rerender } = render(
      <VoiceButton
        isGenerating={false}
        isPlaying={false}
        onPlay={() => {}}
        onStop={() => {}}
        size="sm"
      />
    );
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('w-8 h-8');
    
    rerender(
      <VoiceButton
        isGenerating={false}
        isPlaying={false}
        onPlay={() => {}}
        onStop={() => {}}
        size="md"
      />
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('w-10 h-10');
    
    rerender(
      <VoiceButton
        isGenerating={false}
        isPlaying={false}
        onPlay={() => {}}
        onStop={() => {}}
        size="lg"
      />
    );
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('w-12 h-12');
  });
});