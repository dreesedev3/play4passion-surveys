import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text (Open-ended)' },
  { value: 'single_choice', label: 'Single Choice' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'rating', label: 'Rating Scale' },
  { value: 'boolean', label: 'Yes / No' },
];

function AdminSurveyCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', question_type: 'text', options: null, is_required: true },
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '', question_type: 'text', options: null, is_required: true,
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-add empty options array when switching to choice types
    if (field === 'question_type') {
      if (['single_choice', 'multiple_choice'].includes(value)) {
        updated[index].options = updated[index].options || [
          { value: 'option_1', label: 'Option 1' },
          { value: 'option_2', label: 'Option 2' },
        ];
      } else if (value === 'rating') {
        updated[index].options = { min: 1, max: 5 };
      } else {
        updated[index].options = null;
      }
    }

    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, label) => {
    const updated = [...questions];
    const opts = [...updated[qIndex].options];
    opts[optIndex] = {
      value: label.toLowerCase().replace(/\s+/g, '_'),
      label,
    };
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    const opts = [...updated[qIndex].options];
    opts.push({ value: `option_${opts.length + 1}`, label: `Option ${opts.length + 1}` });
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter a survey title');
    if (questions.some((q) => !q.question_text.trim())) {
      return alert('All questions must have text');
    }

    setSaving(true);

    try {
      const res = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, questions }),
      });

      if (!res.ok) throw new Error('Failed to create survey');

      const survey = await res.json();
      navigate(`/admin/surveys/${survey.id}`);
    } catch (err) {
      alert('Failed to create survey. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 mb-4 text-sm hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Survey</h1>

        {/* Survey Title & Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Survey Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Career Exploration Student Survey"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                       focus:border-blue-500 focus:outline-none mb-4"
          />

          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description shown to participants before they begin"
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                       focus:border-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Questions */}
        {questions.map((q, qIndex) => (
          <div
            key={qIndex}
            className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-blue-600">
                Question {qIndex + 1}
              </span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-400 text-sm hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              type="text"
              value={q.question_text}
              onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
              placeholder="Enter your question"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                         focus:border-blue-500 focus:outline-none mb-3"
            />

            <div className="flex items-center gap-4 mb-3">
              <select
                value={q.question_type}
                onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg
                           focus:border-blue-500 focus:outline-none text-sm"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={q.is_required}
                  onChange={(e) => updateQuestion(qIndex, 'is_required', e.target.checked)}
                  className="w-4 h-4"
                />
                Required
              </label>
            </div>

            {/* Options editor for choice questions */}
            {Array.isArray(q.options) && (
              <div className="ml-4 mt-3 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase">Options</p>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                                 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() => removeOption(qIndex, optIndex)}
                        className="text-red-400 text-xs hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addOption(qIndex)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  + Add option
                </button>
              </div>
            )}

            {/* Rating config */}
            {q.question_type === 'rating' && q.options && !Array.isArray(q.options) && (
              <div className="flex items-center gap-4 mt-3 ml-4">
                <label className="text-sm text-gray-600">
                  Min:
                  <input
                    type="number"
                    value={q.options.min || 1}
                    onChange={(e) => updateQuestion(qIndex, 'options', {
                      ...q.options, min: parseInt(e.target.value),
                    })}
                    className="ml-2 w-16 px-2 py-1 border rounded text-center"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  Max:
                  <input
                    type="number"
                    value={q.options.max || 5}
                    onChange={(e) => updateQuestion(qIndex, 'options', {
                      ...q.options, max: parseInt(e.target.value),
                    })}
                    className="ml-2 w-16 px-2 py-1 border rounded text-center"
                  />
                </label>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                     text-gray-500 hover:border-blue-400 hover:text-blue-600
                     transition-colors mb-6"
        >
          + Add Question
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-blue-600 text-white text-lg font-semibold
                     rounded-xl hover:bg-blue-700 disabled:opacity-50
                     transition-colors mb-8"
        >
          {saving ? 'Creating Survey...' : 'Create Survey'}
        </button>
      </div>
    </div>
  );
}

export default AdminSurveyCreate;