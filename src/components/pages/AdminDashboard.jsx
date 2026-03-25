import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/verify')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
      })
      .catch(() => navigate('/admin/login'));

    fetch('/api/admin/surveys')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setSurveys)
      .catch(() => navigate('/admin/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your surveys and view responses</p>
          </div>
          <Link
            to="/admin/surveys/new"
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold
                       rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Survey
          </Link>
        </div>

        {surveys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No surveys yet</p>
            <Link
              to="/admin/surveys/new"
              className="text-blue-600 underline font-medium"
            >
              Create your first survey
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey) => (
              <Link
                key={survey.id}
                to={`/admin/surveys/${survey.id}`}
                className="block bg-white rounded-xl shadow-sm p-6 border border-gray-100
                           hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{survey.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {survey.questions?.[0]?.count || 0} questions
                      {' · '}
                      {survey.responses?.[0]?.count || 0} responses
                      {' · '}
                      {survey.access_codes?.[0]?.count || 0} access codes
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${survey.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : survey.status === 'closed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {survey.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;