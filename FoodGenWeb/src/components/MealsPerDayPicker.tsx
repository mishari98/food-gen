import React from 'react';

interface Props {
  value: number;
  onChange: (count: number) => void;
  max?: number;
}

export default function MealsPerDayPicker({ value, onChange, max = 4 }: Props) {
  const counts = Array.from({ length: max }, (_, i) => i + 1);
  
  return (
    <div className="picker-container">
      <div className="segmented-picker">
        {counts.map(count => (
          <button
            key={count}
            className={`segmented-option ${value === count ? 'active' : ''}`}
            onClick={() => onChange(count)}
          >
            {count} {count === 1 ? 'Meal' : 'Meals'}
          </button>
        ))}
      </div>
    </div>
  );
}
