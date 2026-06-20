import React from 'react';

interface Props {
  value: number;
  onChange: (count: number) => void;
}

export default function MealsPerDayPicker({ value, onChange }: Props) {
  return (
    <div className="picker-container">
      <div className="segmented-picker">
        {[1, 2, 3].map(count => (
          <button
            key={count}
            className={`segmented-option ${value === count ? 'active' : ''}`}
            onClick={() => onChange(count)}
          >
            {count} {'🍽️'.repeat(count)}
          </button>
        ))}
      </div>
    </div>
  );
}