import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('shows text when provided', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('hides text when not provided', () => {
    render(<LoadingSpinner />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom size', () => {
    const { container } = render(<LoadingSpinner size={48} />);
    const spinner = container.querySelector('.loading-spinner') as HTMLElement;
    expect(spinner?.style.width).toBe('48px');
    expect(spinner?.style.height).toBe('48px');
  });

  it('applies custom color as borderTopColor', () => {
    const { container } = render(<LoadingSpinner color="#FF0000" />);
    const spinner = container.querySelector('.loading-spinner') as HTMLElement;
    expect(spinner?.style.borderTopColor).toBe('rgb(255, 0, 0)');
  });
});