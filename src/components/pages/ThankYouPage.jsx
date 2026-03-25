import { useNavigate } from 'react-router-dom';

function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Thank You!
        </h1>
        <p className="text-gray-500 mb-6">
          Your responses have been submitted successfully.
          Thank you for your time and participation.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg
                     hover:bg-gray-200 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

export default ThankYouPage;