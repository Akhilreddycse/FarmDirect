import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 5, count = 0, size = 'sm', showCount = true }) => {
  const stars = [1, 2, 3, 4, 5];
  const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-stone-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-stone-700">
        {Number(rating || 5).toFixed(1)}
      </span>
      {showCount && count > 0 && (
        <span className="text-[11px] text-stone-400">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
