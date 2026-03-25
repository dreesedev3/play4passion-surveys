import supabase from '../_utils/supabase.js';
import { verifyAdmin } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { surveyId } = req.query;

  if (!surveyId) {
    return res.status(400).json({ error: 'Survey ID is required' });
  }

  // Get survey details
  const { data: survey } = await supabase
    .from('surveys')
    .select('title')
    .eq('id', surveyId)
    .single();

  // Get all questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('survey_id', surveyId)
    .order('display_order', { ascending: true });

  // Get all responses with their answers
  const { data: responses } = await supabase
    .from('responses')
    .select('*, response_answers(*), access_codes(code)')
    .eq('survey_id', surveyId)
    .order('created_at', { ascending: true });

  // Format as CSV
  const headers = [
    'Response ID',
    'Access Code',
    'Submitted At',
    ...questions.map((q) => q.question_text),
  ];

  const rows = (responses || []).map((r) => {
    const answerMap = {};
    (r.response_answers || []).forEach((a) => {
      answerMap[a.question_id] = a.answer_text || JSON.stringify(a.answer_value) || '';
    });

    return [
      r.id,
      r.access_codes?.code || 'N/A',
      r.completed_at || r.created_at,
      ...questions.map((q) => answerMap[q.id] || ''),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const format = req.query.format || 'json';

  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${survey?.title || 'survey'}-responses.csv"`
    );
    return res.status(200).send(csvContent);
  }

  return res.status(200).json({
    survey,
    questions,
    responses,
    totalResponses: (responses || []).length,
  });
}