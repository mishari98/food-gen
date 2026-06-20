import React from 'react';

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function DifficultyBadge({ difficulty }: Props) {
  const colors: Record<string, { bg: string; color: string; label: string }> = {
    easy: { bg: '#E8F5E9', color: '#2E7D32', label: 'Easy' },
    medium: { bg: '#FFF3E0', color: '#E65100', label: 'Medium' },
    hard: { bg: '#FFEBEE', color: '#C62828', label: 'Hard' },
  };

  const style = colors[difficulty] || colors.easy;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      🔥 {style.label}
    </span>
  );
}