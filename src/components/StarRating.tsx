import React from 'react';
import { Star, Award, ShieldCheck } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  totalReviews?: number;
  reviewsCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  showBadge?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  onClick?: () => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalReviews,
  reviewsCount,
  size = 'sm',
  showNumber = true,
  showBadge = false,
  interactive = false,
  onRatingChange,
  onClick,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const effectiveReviews = totalReviews !== undefined ? totalReviews : reviewsCount;

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-bold',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 ${
        onClick ? 'cursor-pointer hover:opacity-85 transition' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = currentVal >= star;
          const isHalf = !isFilled && currentVal >= star - 0.5;

          const starIcon = (
            <Star
              className={`${starSizes[size]} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-stone-300 fill-stone-100'
              }`}
            />
          );

          if (interactive) {
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => onRatingChange && onRatingChange(star)}
                className="cursor-pointer transition-transform hover:scale-115"
              >
                {starIcon}
              </button>
            );
          }

          return (
            <span key={star} className="inline-flex items-center cursor-default pointer-events-none">
              {starIcon}
            </span>
          );
        })}
      </div>

      {showNumber && (
        <span className={`font-bold text-stone-800 ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {effectiveReviews !== undefined && (
        <span className={`text-stone-500 font-medium ${textSizes[size]}`}>
          ({effectiveReviews} avis)
        </span>
      )}

      {showBadge && rating >= 4.8 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
          <Award className="w-3 h-3 text-amber-600" />
          Top Vendeur 5★
        </span>
      )}
    </div>
  );
};
