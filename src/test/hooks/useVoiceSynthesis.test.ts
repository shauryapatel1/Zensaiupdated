import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceSynthesis } from '../../hooks/useVoiceSynthesis';
import { ErrorCode } from '../../types/errors';

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockImplementation(() => ({
        data: {
          success: true,
          audio_url: 'data:audio/mpeg;base64,test123',
          timestamp: new Date().toISOString()
        },
        error: null
      }))
    }
  }
}));

vi.mock('../../hooks/usePremium', () => ({
  usePremium: () => ({
    isPremium: true,
    trackFeatureUsage: vi.fn().mockReturnValue(true)
  })
}));

// Mock Audio
class MockAudio {
  src: string;
  paused: boolean = true;
  
  constructor(src: string) {
    this.src = src;
  }
  
  play() {
    this.paused = false;
    // Simulate successful play
    setTimeout(() => {
      if (this.onloadstart) this.onloadstart(new Event('loadstart'));
    }, 10);
    return Promise.resolve();
  }
  
  pause() {
    this.paused = true;
  }
  
  // Event handlers
  onloadstart: ((this: HTMLAudioElement, ev: Event) => any) | null = null;
  onended: ((this: HTMLAudioElement, ev: Event) => any) | null = null;
  onerror: ((this: HTMLAudioElement, ev: Event) => any) | null = null;
}

// Replace global Audio with mock
global.Audio = MockAudio as any;

describe('useVoiceSynthesis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should generate and play speech successfully', async () => {
    const { result } = renderHook(() => useVoiceSynthesis());
    
    await act(async () => {
      const success = await result.current.generateAndPlaySpeech('Hello, world!');
      expect(success).toBe(true);
    });
    
    // Check state after successful generation
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle empty text input', async () => {
    const { result } = renderHook(() => useVoiceSynthesis());
    
    await act(async () => {
      const success = await result.current.generateAndPlaySpeech('');
      expect(success).toBe(false);
    });
    
    // Check error state
    expect(result.current.error).toContain('Text is required');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });
  
  it('should stop speech playback', async () => {
    const { result } = renderHook(() => useVoiceSynthesis());
    
    // First play something
    await act(async () => {
      await result.current.generateAndPlaySpeech('Hello, world!');
    });
    
    // Then stop it
    act(() => {
      result.current.stopSpeech();
    });
    
    // Check state after stopping
    expect(result.current.isPlaying).toBe(false);
  });
  
  it('should clear errors', async () => {
    const { result } = renderHook(() => useVoiceSynthesis());
    
    // Generate an error
    await act(async () => {
      await result.current.generateAndPlaySpeech('');
    });
    
    // Verify error exists
    expect(result.current.error).not.toBeNull();
    
    // Clear the error
    act(() => {
      result.current.clearError();
    });
    
    // Check error is cleared
    expect(result.current.error).toBeNull();
  });
});

// Test with non-premium user
describe('useVoiceSynthesis with non-premium user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock non-premium user
    vi.mock('../../hooks/usePremium', () => ({
      usePremium: () => ({
        isPremium: false,
        trackFeatureUsage: vi.fn().mockReturnValue(false)
      })
    }));
  });
  
  it('should show premium required error for free users', async () => {
    const { result } = renderHook(() => useVoiceSynthesis());
    
    await act(async () => {
      const success = await result.current.generateAndPlaySpeech('Hello, world!');
      expect(success).toBe(false);
    });
    
    // Check error state
    expect(result.current.error).toContain('premium feature');
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });
});