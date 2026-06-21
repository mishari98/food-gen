import React from 'react';

interface Props {
  size?: number;
  color?: string;
  text?: string;
}

export default function LoadingSpinner({ size = 32, color = '#FF6B35', text }: Props) {
  return (
    <div className="loading-spinner-container">
      <div
        className="loading-spinner"
        style={{
          width: size,
          height: size,
          borderColor: '#E0E0E0',
          borderTopColor: color,
        }}
      />
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
}