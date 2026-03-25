import { useState, useEffect, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionRenderer from '../survey/QuestionRenderer';

const initialState = { answers: {}, errors: {}, submitting: false };

function surveyReducer(state, action) {
  switch (action.type) {
    case 'SET_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.value },
        errors: { ...state.errors, [action.questionId]: null },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };
    default:
      return state;
  }
}

function SurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [state, dispatch] = useReducer(surveyReducer, initialState);

  useEffect(() => {
    fetch(`/api/surveys/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Survey not found');
        return res.json();
      })
      .then(setSurvey)
      .catch((err) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (questionId, value) => {
    dispatch({ type: 'SET_ANSWER', questionId, value });
  };

  const validate = () => {
    const errors = {};
    (survey?.questions || []).forEach((q) => {
      const val = state.answers[q.id];
      if (q.is_required && (val === undefined || val === '' ||
          (Array.isArray(val) && val.length === 0))) {
        errors[q.id] = 'This question is required';
      }
    });
    dispatch({ type: 'SET_ERRORS', errors });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', value: true });

    try {
      const accessCode = sessionStorage.getItem('accessCode');
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: id,
          accessCode,
          answers: state.answers,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit');

      sessionStorage.removeItem('accessCode');
      navigate('/thank-you');
    } catch (err) {
      dispatch({ type: 'SET_SUBMITTING', value: false });
      alert('Failed to submit your response. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading survey...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{fetchError}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-500 mt-2">{survey.description}</p>
          )}
          <p className="text-sm text-gray-400 mt-1">
            {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {survey.questions.map((question, index) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            number={index + 1}
            value={state.answers[question.id]}
            onChange={handleChange}
            error={state.errors[question.id]}
          />
        ))}

        <button
          onClick={handleSubmit}
          disabled={state.submitting}
          className="w-full py-4 bg-blue-600 text-white text-lg font-semibold
                     rounded-xl hover:bg-blue-700 disabled:opacity-50
                     transition-colors mt-4 mb-8"
        >
          {state.submitting ? 'Submitting...' : 'Submit Responses'}
        </button>
      </div>
    </div>
  );
}

export default SurveyPage;