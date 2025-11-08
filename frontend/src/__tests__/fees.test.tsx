import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StudentFeesPage from '../pages/StudentFeesPage';
import AdminInvoicePage from '../pages/AdminInvoicePage';

describe('Fee pages', () => {
  it('renders student fee dashboard', () => {
    render(<StudentFeesPage />);
    expect(screen.getByText(/Fee Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Outstanding Balance/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('allows admin to add invoice items', () => {
    render(<AdminInvoicePage />);
    expect(screen.getByText(/Invoice Generation/i)).toBeInTheDocument();
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);
    const textInputs = screen.getAllByPlaceholderText(/Description/i);
    expect(textInputs.length).toBeGreaterThan(1);
  });
});

