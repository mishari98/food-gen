import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MealPlanProvider } from '../../context/MealPlanContext';
import WeekPage from '../../pages/WeekPage';

function renderWithProviders() {
  return render(
    <MealPlanProvider>
      <BrowserRouter>
        <WeekPage />
      </BrowserRouter>
    </MealPlanProvider>
  );
}

describe('WeekPage', () => {
  it('renders week title', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Week/)).toBeInTheDocument();
    });
  });

  it('renders home button', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('🏠')).toBeInTheDocument();
    });
  });

  it('renders settings button', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('⚙️')).toBeInTheDocument();
    });
  });

  it('shows week date input', async () => {
    renderWithProviders();
    await waitFor(() => {
      const dateInput = document.querySelector('input[type="date"]');
      expect(dateInput).toBeInTheDocument();
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