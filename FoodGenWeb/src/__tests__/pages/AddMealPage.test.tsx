import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MealPlanProvider } from '../../context/MealPlanContext';
import AddMealPage from '../../pages/AddMealPage';

function renderWithProviders() {
  return render(
    <MealPlanProvider>
      <BrowserRouter>
        <AddMealPage />
      </BrowserRouter>
    </MealPlanProvider>
  );
}

describe('AddMealPage', () => {
  it('renders the header title', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Add Meal/)).toBeInTheDocument();
    });
  });

  it('renders meal name input', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Pork Sisig/)).toBeInTheDocument();
    });
  });

  it('renders cuisine selector', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Cuisine')).toBeInTheDocument();
    });
  });

  it('renders suggested for checkboxes', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Suggested For/)).toBeInTheDocument();
    });
  });

  it('renders prep time input', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Prep Time/)).toBeInTheDocument();
    });
  });

  it('renders difficulty radio buttons', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
    });
  });

  it('renders ingredients section', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Ingredients/)).toBeInTheDocument();
    });
  });

  it('renders steps section', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Steps/)).toBeInTheDocument();
    });
  });

  it('renders save button', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText(/Save Meal/)).toBeInTheDocument();
    });
  });

  it('can add an ingredient row', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('+ Add Ingredient')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('+ Add Ingredient'));
    // Should now have 2 ingredient rows
    const ingredientInputs = screen.getAllByPlaceholderText('Ingredient name');
    expect(ingredientInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('can add a step', async () => {
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText('+ Add Step')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('+ Add Step'));
    const stepTextareas = document.querySelectorAll('textarea');
    expect(stepTextareas.length).toBeGreaterThanOrEqual(2);
  });
});