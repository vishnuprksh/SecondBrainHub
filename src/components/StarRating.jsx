import { HiStar } from 'react-icons/hi';

export default function StarRating({ rating = 0, size = 18, interactive = false, onRate }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          className={`star ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <HiStar
            size={size}
            className={
              star <= Math.round(rating)
                ? 'text-amber-400'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
    </div>
  );
}
