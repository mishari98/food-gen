import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MealPlanProvider } from '../../context/MealPlanContext';
import HistoryPage from '../../pages/HistoryPage';

function renderWithProviders() {
  return render(
    <MealPlanProvider>
      <BrowserRouter>
        <HistoryPage />
      </BrowserRouter>
    </MealPlanProvider>
  );
}

describe('HistoryPage', () => {
  it('renders the header title', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Plan History/)).toBeInTheDocument();
    });
  });

  it('renders week selector with current week', async () => {
    renderWithProviders();
    await waitFor(() => {
      const today = new Date();
      const weekNum = getWeekNumber(today);
      expect(screen.getByText(`Week ${weekNum}`)).toBeInTheDocument();
    });
  });

  it('renders navigation buttons', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('◀')).toBeInTheDocument();
      expect(screen.getByText('▶')).toBeInTheDocument();
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

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}