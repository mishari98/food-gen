import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MealPlanProvider } from '../../context/MealPlanContext';
import HouseholdManagementPage from '../../pages/HouseholdManagementPage';

function renderWithProviders() {
  return render(
    <MealPlanProvider>
      <BrowserRouter>
        <HouseholdManagementPage />
      </BrowserRouter>
    </MealPlanProvider>
  );
}

describe('HouseholdManagementPage', () => {
  it('shows household title when not admin', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Household/)).toBeInTheDocument();
    });
  });

  it('shows non-admin message when not admin', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Only admins/)).toBeInTheDocument();
    });
  });

  it('renders back button', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('←')).toBeInTheDocument();
    });
  });

  it('renders content area', async () => {
    renderWithProviders();
    await waitFor(() => {
      const contentArea = document.querySelector('.content-area');
      expect(contentArea).toBeInTheDocument();
    });
  });
});