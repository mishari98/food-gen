import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MealPlanProvider } from '../context/MealPlanContext';
import OnboardingPage from '../pages/OnboardingPage';

describe('App root routing', () => {
  it('OnboardingPage renders FoodGen title', async () => {
    render(
      <MealPlanProvider>
        <MemoryRouter>
          <OnboardingPage />
        </MemoryRouter>
      </MealPlanProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/FoodGen/)).toBeInTheDocument();
    });
  });

  it('OnboardingPage shows Filipino Meal Planning subtitle', async () => {
    render(
      <MealPlanProvider>
        <MemoryRouter>
          <OnboardingPage />
        </MemoryRouter>
      </MealPlanProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Filipino Meal Planning/)).toBeInTheDocument();
    });
  });

  it('OnboardingPage displays signup and login options', async () => {
    render(
      <MealPlanProvider>
        <MemoryRouter>
          <OnboardingPage />
        </MemoryRouter>
      </MealPlanProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
    expect(screen.getByText(/Log In/)).toBeInTheDocument();
  });
});