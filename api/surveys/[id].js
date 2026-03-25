import supabase from '../_utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Get the survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .eq('is_deleted', false)
    .single();

  if (surveyError || !survey) {
    return res.status(404).json({ error: 'Survey not found' });
  }

  // Get the questions in order
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('survey_id', id)
    .order('display_order', { ascending: true });

  return res.status(200).json({ ...survey, questions: questions || [] });
}