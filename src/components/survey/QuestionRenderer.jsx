import QUESTION_COMPONENTS from './questions';

function QuestionRenderer({ question, value, onChange, error, number }) {
  const QuestionComponent = QUESTION_COMPONENTS[question.question_type];

  if (!QuestionComponent) {
    return <p className="text-red-500">Unsupported question type</p>;
  }

  return (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <label className="block text-lg font-medium text-gray-800 mb-4">
        <span className="text-blue-600 font-bold mr-2">{number}.</span>
        {question.question_text}
        {question.is_required && (
          <span className="text-red-400 ml-1">*</span>
        )}
      </label>

      <QuestionComponent
        question={question}
        value={value}
        onChange={(val) => onChange(question.id, val)}
      />

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

export default QuestionRenderer;