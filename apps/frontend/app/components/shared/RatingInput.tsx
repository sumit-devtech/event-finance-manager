import { Star } from "../Icons";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  starSize?: number;
  className?: string;
}

export function RatingInput({
  value,
  onChange,
  maxRating = 5,
  starSize = 32,
  className = "",
}: RatingInputProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="focus:outline-none transition-transform hover:scale-110"
          aria-label={`Rate ${rating} out of ${maxRating}`}
        >
          <Star
            size={starSize}
            className={rating <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}

