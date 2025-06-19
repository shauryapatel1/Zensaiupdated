import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils';
import JournalEntryForm from '../../../components/journal/JournalEntryForm';
import { MoodLevel } from '../../../types';

// Mock child components
vi.mock('../../../components/MoodSelector', () => ({
  default: ({ onMoodSelect }: { onMoodSelect: (mood: MoodLevel) => void }) => (
    <div data-testid="mood-selector">
      <button onClick={() => onMoodSelect(4)}>Select Good Mood</button>
    </div>
  )
}));

vi.mock('../../../components/PhotoUpload', () => ({
  default: ({ onPhotoSelect }: { onPhotoSelect: (file: File | null) => void }) => (
    <div data-testid="photo-upload">
      <button onClick={() => onPhotoSelect(new File([''], 'test.jpg', { type: 'image/jpeg' }))}>
        Upload Photo
      </button>
      <button onClick={() => onPhotoSelect(null)}>Remove Photo</button>
    </div>
  )
}));

describe('JournalEntryForm', () => {
  it('renders form elements correctly', () => {
    const mockSubmit = vi.fn();
    
    render(
      <JournalEntryForm
        onSubmit={mockSubmit}
        isSubmitting={false}
        error=""
        dailyPrompt="What are you grateful for today?"
        isLoadingPrompt={false}
        onGenerateNewPrompt={vi.fn()}
        showMoodSuggestion={false}
        aiDetectedMood={null}
        onAcceptAiMood={vi.fn()}
        onDismissMoodSuggestion={vi.fn()}
      />
    );
    
    // Check that form elements are rendered
    expect(screen.getByLabelText(/entry title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your thoughts/i)).toBeInTheDocument();
    expect(screen.getByText(/what are you grateful for today/i)).toBeInTheDocument();
    expect(screen.getByTestId('mood-selector')).toBeInTheDocument();
    expect(screen.getByTestId('photo-upload')).toBeInTheDocument();
    
    // Submit button should be disabled initially
    const submitButton = screen.getByLabelText('Save journal entry');
    expect(submitButton).toBeDisabled();
  });
  
  it('enables submit button when form is valid', async () => {
    const mockSubmit = vi.fn();
    
    render(
      <JournalEntryForm
        onSubmit={mockSubmit}
        isSubmitting={false}
        error=""
        dailyPrompt="What are you grateful for today?"
        isLoadingPrompt={false}
        onGenerateNewPrompt={vi.fn()}
        showMoodSuggestion={false}
        aiDetectedMood={null}
        onAcceptAiMood={vi.fn()}
        onDismissMoodSuggestion={vi.fn()}
      />
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/your thoughts/i), {
      target: { value: 'This is my journal entry' }
    });
    
    // Select a mood
    fireEvent.click(screen.getByText('Select Good Mood'));
    
    // Submit button should now be enabled
    await waitFor(() => {
      const submitButton = screen.getByLabelText('Save journal entry');
      expect(submitButton).not.toBeDisabled();
    });
  });
  
  it('submits the form with correct data', async () => {
    const mockSubmit = vi.fn();
    
    render(
      <JournalEntryForm
        onSubmit={mockSubmit}
        isSubmitting={false}
        error=""
        dailyPrompt="What are you grateful for today?"
        isLoadingPrompt={false}
        onGenerateNewPrompt={vi.fn()}
        showMoodSuggestion={false}
        aiDetectedMood={null}
        onAcceptAiMood={vi.fn()}
        onDismissMoodSuggestion={vi.fn()}
      />
    );
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/entry title/i), {
      target: { value: 'My Journal Title' }
    });
    
    fireEvent.change(screen.getByLabelText(/your thoughts/i), {
      target: { value: 'This is my journal entry' }
    });
    
    // Select a mood
    fireEvent.click(screen.getByText('Select Good Mood'));
    
    // Upload a photo
    fireEvent.click(screen.getByText('Upload Photo'));
    
    // Submit the form
    const submitButton = screen.getByLabelText('Save journal entry');
    fireEvent.click(submitButton);
    
    // Check that onSubmit was called with the correct data
    expect(mockSubmit).toHaveBeenCalledWith(
      'This is my journal entry',
      'My Journal Title',
      4,
      expect.any(File)
    );
  });
  
  it('displays error message', () => {
    const mockSubmit = vi.fn();
    
    render(
      <JournalEntryForm
        onSubmit={mockSubmit}
        isSubmitting={false}
        error="Failed to save journal entry"
        dailyPrompt="What are you grateful for today?"
        isLoadingPrompt={false}
        onGenerateNewPrompt={vi.fn()}
        showMoodSuggestion={false}
        aiDetectedMood={null}
        onAcceptAiMood={vi.fn()}
        onDismissMoodSuggestion={vi.fn()}
      />
    );
    
    // Check that error message is displayed
    expect(screen.getByText('Failed to save journal entry')).toBeInTheDocument();
  });
  
  it('shows loading state when submitting', () => {
    const mockSubmit = vi.fn();
    
    render(
      <JournalEntryForm
        onSubmit={mockSubmit}
        isSubmitting={true}
        error=""
        dailyPrompt="What are you grateful for today?"
        isLoadingPrompt={false}
        onGenerateNewPrompt={vi.fn()}
        showMoodSuggestion={false}
        aiDetectedMood={null}
        onAcceptAiMood={vi.fn()}
        onDismissMoodSuggestion={vi.fn()}
      />
    );
    
    // Check that form is in loading state
    expect(screen.getByText(/saving your thoughts/i)).toBeInTheDocument();

    // Form elements should be disabled
    expect(screen.getByLabelText(/entry title/i)).toBeDisabled();
    expect(screen.getByLabelText(/your thoughts/i)).toBeDisabled();
  });
  
  it('shows AI mood suggestion when available', () => {
    const mockSubmit = vi.fn();
    const mockAcceptAiMood = vi.fn();
    const mockDismissMoodSuggestion = vi.fn();
    
    render(
      <JournalEntryForm
        onSubmit={mockSubmit}
        isSubmitting={false}
        error=""
        dailyPrompt="What are you grateful for today?"
        isLoadingPrompt={false}
        onGenerateNewPrompt={vi.fn()}
        showMoodSuggestion={true}
        aiDetectedMood={4}
        onAcceptAiMood={mockAcceptAiMood}
        onDismissMoodSuggestion={mockDismissMoodSuggestion}
      />
    );
    
    // Check that mood suggestion is displayed
    expect(screen.getByText(/based on your writing/i)).toBeInTheDocument();
    
    // Accept the suggestion
    fireEvent.click(screen.getByText('Yes'));
    expect(mockAcceptAiMood).toHaveBeenCalledTimes(1);
    
    // Dismiss the suggestion
    fireEvent.click(screen.getByText('No'));
    expect(mockDismissMoodSuggestion).toHaveBeenCalledTimes(1);
  });
});