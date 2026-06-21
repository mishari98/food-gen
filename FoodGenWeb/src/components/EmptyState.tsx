import React from 'react';

interface Props {
  icon?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryMessage?: string;
}

export default function EmptyState({ icon = '🍽️', message, actionLabel, onAction, secondaryMessage }: Props) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <p className="empty-text">{message}</p>
      {actionLabel && onAction && (
        <button className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {secondaryMessage && (
        <p className="empty-secondary">{secondaryMessage}</p>
      )}
    </div>
  );
}
