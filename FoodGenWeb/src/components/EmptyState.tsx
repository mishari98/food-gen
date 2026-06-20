import React from 'react';

interface Props {
  icon?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = '🍽️', message, actionLabel, onAction }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p className="empty-text">{message}</p>
      {actionLabel && onAction && (
        <button className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}