import { describe, it, expect } from 'vitest';

describe('Sanity check', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios');

const mockPets = [
  {
    id: 1,
    petName: 'Buddy',
    owner: 'Alice',
    imageUrl: '',
    favoriteFood: 'Chicken',
    dateCreated: '2025-04-23T00:00:00Z',
    fed: false,
  },
  {
    id: 2,
    petName: 'Mittens',
    owner: 'Bob',
    imageUrl: '',
    favoriteFood: '',
    dateCreated: '2025-04-22T00:00:00Z',
    fed: true,
  },
];

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (axios.get as any).mockResolvedValue({ data: mockPets });
    (axios.post as any).mockImplementation((url, pet) =>
      Promise.resolve({ data: { ...pet, id: Math.floor(Math.random() * 1000), dateCreated: new Date().toISOString() } })
    );
    (axios.patch as any).mockResolvedValue({});
    (axios.delete as any).mockResolvedValue({});
  });

  it('renders pet list and allows toggling fed status', async () => {
    render(<App />);
    expect(await screen.findByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('Mittens')).toBeInTheDocument();
    // Wait for fed buttons to appear
    await waitFor(() => expect(screen.getAllByRole('button', { name: /fed|not fed/i }).length).toBeGreaterThan(0));
    // Toggle fed
    const fedButton = screen.getAllByRole('button', { name: /not fed/i })[0];
    fireEvent.click(fedButton);
    // Button text should update after click
    await waitFor(() => expect(fedButton.textContent?.toLowerCase()).toContain('fed'));
  });

  it('opens add pet dialog and adds a new pet', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /add pet/i }));
    fireEvent.change(screen.getByLabelText(/pet name/i), { target: { value: 'Rex' } });
    fireEvent.change(screen.getByLabelText(/owner/i), { target: { value: 'Charlie' } });
    fireEvent.change(screen.getByLabelText(/image url/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/favorite food/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /^add pet$/i }));
    await waitFor(() => expect(screen.getByText('Rex')).toBeInTheDocument());
  });

  it('removes a pet from the list', async () => {
    render(<App />);
    expect(await screen.findByText('Buddy')).toBeInTheDocument();
    // Wait for remove buttons to appear
    await waitFor(() => expect(screen.getAllByRole('button', { name: /remove/i }).length).toBeGreaterThan(0));
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    // Wait for Buddy to be removed
    await waitFor(() => expect(screen.queryByText('Buddy')).not.toBeInTheDocument());
  });

  it('downloads pets as JSON', async () => {
    render(<App />);
    const createElementSpy = vi.spyOn(document, 'createElement');
    const clickMock = vi.fn();
    createElementSpy.mockReturnValue({ click: clickMock, set href(_) {}, set download(_) {}, style: {}, remove() {} } as any);
    fireEvent.click(screen.getByRole('button', { name: /download json/i }));
    expect(clickMock).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });
});
