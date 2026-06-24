import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MealPlanProvider } from '../../context/MealPlanContext';
import SettingsPage from '../../pages/SettingsPage';

function renderWithProviders() {
  return render(
    <MealPlanProvider>
      <BrowserRouter>
        <SettingsPage />
      </BrowserRouter>
    </MealPlanProvider>
  );
}

describe('SettingsPage', () => {
  it('renders settings title', () => {
    renderWithProviders();
    expect(screen.getByText(/Settings/)).toBeInTheDocument();
  });

  it('renders account section', () => {
    renderWithProviders();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('renders about section', () => {
    renderWithProviders();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('shows sign out button', () => {
    renderWithProviders();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('shows app version in about section', () => {
    renderWithProviders();
    expect(screen.getByText(/Version 1\.0\.0/)).toBeInTheDocument();
  });
});