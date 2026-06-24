import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OnboardingPage from '../../pages/OnboardingPage';
import { MealPlanProvider } from '../../context/MealPlanContext';

function renderWithProviders() {
  return render(
    <MealPlanProvider>
      <BrowserRouter>
        <OnboardingPage />
      </BrowserRouter>
    </MealPlanProvider>
  );
}

describe('OnboardingPage', () => {
  it('renders the app title and subtitle', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('FoodGen')).toBeInTheDocument();
    });
    expect(screen.getByText(/Filipino Meal Planning/i)).toBeInTheDocument();
  });

  it('renders signup form with all fields', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Juan Dela Cruz')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('juan@example.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
  });

  it('toggles between signup and login form', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    
    // Switch to login
    fireEvent.click(screen.getByText('Log In'));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Juan Dela Cruz')).not.toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('juan@example.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(1);
  });

  it('shows forgot password modal in login mode', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Log In'));
    
    await waitFor(() => {
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
    });
  });

  it('shows error for password mismatch on signup form', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByPlaceholderText('juan@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'password123' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'different' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error for short password on signup form', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByPlaceholderText('juan@example.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: '123' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: '123' } });
    
    const form = document.querySelector('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });
});