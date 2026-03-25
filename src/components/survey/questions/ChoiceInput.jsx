function ChoiceInput({ question, value, onChange }) {
  const options = question.options || [];
  const isMulti = question.question_type === 'multiple_choice' || question.question_type === 'checkbox';

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const updated = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      onChange(updated);
    } else {
      onChange(optionValue);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => {
        const optVal = option.value || option;
        const optLabel = option.label || option;
        const isSelected = isMulti
          ? (Array.isArray(value) && value.includes(optVal))
          : value === optVal;

        return (
          <button
            key={optVal}
            type="button"
            onClick={() => handleSelect(optVal)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors
              ${isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <span className="flex items-center gap-3">
              <span className={`w-5 h-5 flex items-center justify-center border-2 
                ${isMulti ? 'rounded' : 'rounded-full'}
                ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}
              >
                {isSelected && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </span>
              {optLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ChoiceInput;