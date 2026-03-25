import supabase from '../_utils/supabase.js';
import { verifyAdmin } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET — List all surveys
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('surveys')
      .select('*, questions(count), responses(count), access_codes(count)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json(data);
  }

  // POST — Create a new survey with questions
  if (req.method === 'POST') {
    const { title, description, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and at least one question are required' });
    }

    // Create the survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({ title, description, status: 'draft' })
      .select()
      .single();

    if (surveyError) {
      return res.status(500).json({ error: surveyError.message });
    }

    // Add questions with display order
    const formattedQuestions = questions.map((q, index) => ({
      survey_id: survey.id,
      question_text: q.question_text,
      question_type: q.question_type || 'text',
      options: q.options || null,
      is_required: q.is_required !== undefined ? q.is_required : true,
      display_order: index,
    }));

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(formattedQuestions);

    if (questionsError) {
      return res.status(500).json({ error: questionsError.message });
    }

    return res.status(201).json(survey);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}