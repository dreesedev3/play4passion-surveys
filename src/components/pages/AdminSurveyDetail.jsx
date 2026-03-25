import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function AdminSurveyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [codes, setCodes] = useState([]);
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeCount, setCodeCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Verify admin
    fetch('/api/admin/verify')
      .then((res) => { if (!res.ok) throw new Error(); })
      .catch(() => navigate('/admin/login'));

    // Fetch survey and codes
    Promise.all([
      fetch(`/api/admin/export?surveyId=${id}`).then((r) => r.json()),
      fetch(`/api/admin/codes?surveyId=${id}`).then((r) => r.json()),
    ])
      .then(([exportData, codesData]) => {
        setResponses(exportData);
        setCodes(codesData);
        setSurvey(exportData.survey);
      })
      .catch(() => alert('Failed to load survey data'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const generateCodes = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId: id, count: codeCount }),
      });
      const newCodes = await res.json();
      setCodes([...newCodes, ...codes]);
    } catch {
      alert('Failed to generate codes');
    }
    setGenerating(false);
  };

  const updateStatus = async (status) => {
    try {
      await fetch(`/api/admin/survey-detail?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setSurvey({ ...survey, status });
    } catch {
      alert('Failed to update status');
    }
  };

  const exportCSV = () => {
    window.open(`/api/admin/export?surveyId=${id}&format=csv`, '_blank');
  };

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
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 mb-4 text-sm hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Survey Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{survey?.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
              ${responses?.survey?.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {responses?.survey?.status || 'draft'}
            </span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => updateStatus('active')}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg
                         hover:bg-green-700 transition-colors"
            >
              Activate
            </button>
            <button
              onClick={() => updateStatus('closed')}
              className="px-4 py-2 bg-red-100 text-red-600 text-sm rounded-lg
                         hover:bg-red-200 transition-colors"
            >
              Close Survey
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg
                         hover:bg-gray-200 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
            <p className="text-3xl font-bold text-blue-600">
              {responses?.questions?.length || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Questions</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
            <p className="text-3xl font-bold text-green-600">
              {responses?.totalResponses || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">Responses</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 text-center border border-gray-100">
            <p className="text-3xl font-bold text-purple-600">{codes.length}</p>
            <p className="text-sm text-gray-400 mt-1">Access Codes</p>
          </div>
        </div>

        {/* Access Codes Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Access Codes</h2>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-600">Generate</label>
            <input
              type="number"
              value={codeCount}
              onChange={(e) => setCodeCount(parseInt(e.target.value) || 1)}
              min={1}
              max={100}
              className="w-20 px-3 py-2 border rounded-lg text-center text-sm"
            />
            <label className="text-sm text-gray-600">codes</label>
            <button
              onClick={generateCodes}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg
                         hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {codes.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {codes.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="font-mono font-bold text-sm">{c.code}</span>
                  <span className="text-xs text-gray-400">
                    {c.current_uses}{c.max_uses ? `/${c.max_uses}` : ''} used
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Responses ({responses?.totalResponses || 0})
          </h2>

          {responses?.totalResponses === 0 ? (
            <p className="text-gray-400 text-center py-8">No responses yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold">#</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold">Code</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-semibold">Submitted</th>
                    {responses?.questions?.map((q) => (
                      <th key={q.id} className="text-left py-2 px-3 text-gray-500 font-semibold 
                                                max-w-[200px] truncate">
                        {q.question_text}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses?.responses?.map((r, i) => {
                    const answerMap = {};
                    (r.response_answers || []).forEach((a) => {
                      answerMap[a.question_id] = a.answer_text ||
                        (a.answer_value ? JSON.stringify(a.answer_value) : '');
                    });

                    return (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                        <td className="py-2 px-3 font-mono text-xs">
                          {r.access_codes?.code || 'N/A'}
                        </td>
                        <td className="py-2 px-3 text-gray-500 text-xs">
                          {new Date(r.completed_at || r.created_at).toLocaleDateString()}
                        </td>
                        {responses?.questions?.map((q) => (
                          <td key={q.id} className="py-2 px-3 max-w-[200px] truncate">
                            {answerMap[q.id] || '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSurveyDetail;