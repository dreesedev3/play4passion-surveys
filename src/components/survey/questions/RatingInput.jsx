function RatingInput({ question, value, onChange }) {
  const meta = question.options || {};
  const min = meta.min || 1;
  const max = meta.max || 5;
  const points = [];

  for (let i = min; i <= max; i++) {
    points.push(i);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {points.map((point) => (
        <button
          key={point}
          type="button"
          onClick={() => onChange(point)}
          className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-colors
            ${value === point
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
        >
          {point}
        </button>
      ))}
    </div>
  );
}

export default RatingInput;