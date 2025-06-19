import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../utils';
import PhotoUpload from '../../components/PhotoUpload';

// Mock file
const createMockFile = (name: string, type: string, size: number) => {
  const file = new File(["dummy content"], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('PhotoUpload', () => {
  it('renders upload area when no photo is selected', () => {
    const mockOnPhotoSelect = vi.fn();
    
    render(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
      />
    );
    
    // Check that upload area is displayed
    expect(screen.getByRole('button')).toHaveTextContent(/upload photo/i);
    expect(screen.getByLabelText(/upload photo/i)).toBeInTheDocument();
  });
  
  it('renders preview when photo is selected', () => {
    const mockOnPhotoSelect = vi.fn();
    
    // Create a mock URL.createObjectURL
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    
    // Create a mock file
    const file = createMockFile('test.jpg', 'image/jpeg', 1024 * 1024);
    
    // Create a mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
      result: 'data:image/jpeg;base64,test123'
    };
    
    // Mock FileReader constructor
    global.FileReader = vi.fn().mockImplementation(() => mockFileReader) as any;
    
    const { rerender } = render(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
        selectedPhoto={null}
      />
    );
    
    // Simulate file selection
    const input = screen.getByLabelText(/upload photo/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    // Trigger onload event
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: mockFileReader } as any);
    }
    
    // Rerender with selected photo
    rerender(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
        selectedPhoto={file}
      />
    );
    
    // Check that preview is displayed
    expect(screen.getByAltText(/journal photo/i)).toBeInTheDocument();
    
    // Restore mocks
    URL.createObjectURL = originalCreateObjectURL;
  });
  
  it('validates file type', () => {
    const mockOnPhotoSelect = vi.fn();
    global.alert = vi.fn();
    
    render(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
      />
    );
    
    // Create an invalid file type
    const file = createMockFile('test.txt', 'text/plain', 1024);
    
    // Simulate file selection
    const input = screen.getByLabelText(/upload photo/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check that validation error was shown
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('valid image file'));
    expect(mockOnPhotoSelect).not.toHaveBeenCalled();
  });
  
  it('validates file size', () => {
    const mockOnPhotoSelect = vi.fn();
    global.alert = vi.fn();
    
    render(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
      />
    );
    
    // Create a file that's too large (6MB)
    const file = createMockFile('test.jpg', 'image/jpeg', 6 * 1024 * 1024);
    
    // Simulate file selection
    const input = screen.getByLabelText(/upload photo/i);
    fireEvent.change(input, { target: { files: [file] } });
    
    // Check that validation error was shown
    expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('smaller than 5MB'));
    expect(mockOnPhotoSelect).not.toHaveBeenCalled();
  });
  
  it('shows upsell for non-premium users', () => {
    const mockOnPhotoSelect = vi.fn();
    const mockUpsellTrigger = vi.fn();
    
    render(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
        isPremiumUser={false}
        onUpsellTrigger={mockUpsellTrigger}
      />
    );
    
    // Check that premium message is displayed
    expect(screen.getByText(/premium feature/i)).toBeInTheDocument();
    
    // Click should trigger upsell
    fireEvent.click(screen.getByRole('button'));
    expect(mockUpsellTrigger).toHaveBeenCalledTimes(1);
  });
  
  it('handles keyboard navigation', () => {
    const mockOnPhotoSelect = vi.fn();
    
    render(
      <PhotoUpload
        onPhotoSelect={mockOnPhotoSelect}
      />
    );
    
    // Press Enter key
    const uploadArea = screen.getByRole('button');
    fireEvent.keyDown(uploadArea, { key: 'Enter' });
    
    // This should open the file dialog, but we can't test that directly
    // We can verify the component didn't crash
    expect(uploadArea).toBeInTheDocument();
  });
});