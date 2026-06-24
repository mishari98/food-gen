import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DifficultyBadge from '../../components/DifficultyBadge';

describe('DifficultyBadge', () => {
  it('renders Easy with green styling', () => {
    const { container } = render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByText(/Easy/)).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span?.style.color).toBe('rgb(46, 125, 50)');
  });

  it('renders Medium with orange styling', () => {
    const { container } = render(<DifficultyBadge difficulty="medium" />);
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span?.style.color).toBe('rgb(230, 81, 0)');
  });

  it('renders Hard with red styling', () => {
    const { container } = render(<DifficultyBadge difficulty="hard" />);
    expect(screen.getByText(/Hard/)).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span?.style.color).toBe('rgb(198, 40, 40)');
  });

  it('defaults to easy for unknown difficulty', () => {
    render(<DifficultyBadge difficulty={'unknown' as any} />);
    expect(screen.getByText(/Easy/)).toBeInTheDocument();
  });

  it('shows fire emoji', () => {
    render(<DifficultyBadge difficulty="easy" />);
    expect(screen.getByText(/🔥/)).toBeInTheDocument();
  });
});
