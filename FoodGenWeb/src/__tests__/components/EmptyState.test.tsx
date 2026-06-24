import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../../components/EmptyState';

describe('EmptyState', () => {
  it('renders message text', () => {
    render(<EmptyState message="No meals planned" />);
    expect(screen.getByText('No meals planned')).toBeInTheDocument();
  });

  it('renders default icon', () => {
    render(<EmptyState message="Empty" />);
    expect(screen.getByText('🍽️')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    render(<EmptyState message="Empty" icon="📅" />);
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('shows action button when actionLabel provided', () => {
    render(<EmptyState message="Empty" actionLabel="Generate" onAction={() => {}} />);
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });

  it('calls onAction when button clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState message="Empty" actionLabel="Generate" onAction={onAction} />);
    fireEvent.click(screen.getByText('Generate'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('hides button when no actionLabel', () => {
    render(<EmptyState message="Empty" onAction={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows secondary message when provided', () => {
    render(<EmptyState message="Empty" secondaryMessage="Ask admin" />);
    expect(screen.getByText('Ask admin')).toBeInTheDocument();
  });
});