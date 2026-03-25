function BooleanInput({ question, value, onChange }) {
  return (
    <div className="flex gap-3">
      {['Yes', 'No'].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors
            ${value === option
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default BooleanInput;