import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid access code');
        setLoading(false);
        return;
      }

      // Store code and navigate to the survey
      sessionStorage.setItem('accessCode', code.trim().toUpperCase());
      navigate(`/survey/${data.surveyId}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Play4Passion</h1>
          <p className="text-gray-500">Enter your access code to begin the survey</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter access code"
            maxLength={6}
            className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest
                       border-2 border-gray-200 rounded-lg focus:border-blue-500
                       focus:outline-none uppercase"
          />

          {error && (
            <p className="text-red-500 text-sm text-center mt-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={code.length < 4 || loading}
            className="w-full mt-6 py-3 bg-blue-600 text-white font-semibold
                       rounded-lg hover:bg-blue-700 disabled:opacity-40
                       disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking...' : 'Start Survey'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your responses are anonymous and confidential.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;