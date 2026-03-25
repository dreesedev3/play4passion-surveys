import supabase from './_utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { surveyId, accessCode, answers } = req.body;

  if (!surveyId || !accessCode || !answers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate the access code
  const { data: code } = await supabase
    .from('access_codes')
    .select('*')
    .eq('code', accessCode.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (!code) {
    return res.status(403).json({ error: 'Invalid access code' });
  }

  // Create the response record
  const { data: response, error: responseError } = await supabase
    .from('responses')
    .insert({
      survey_id: surveyId,
      access_code_id: code.id,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (responseError) {
    return res.status(500).json({ error: 'Failed to save response' });
  }

  // Format and insert all answers
  const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
    response_id: response.id,
    question_id: questionId,
    answer_text: typeof value === 'string' ? value : null,
    answer_value: typeof value !== 'string' ? value : null,
  }));

  const { error: answersError } = await supabase
    .from('response_answers')
    .insert(formattedAnswers);

  if (answersError) {
    return res.status(500).json({ error: 'Failed to save answers' });
  }

  // Increment the access code usage counter
  await supabase
    .from('access_codes')
    .update({ current_uses: code.current_uses + 1 })
    .eq('id', code.id);

  return res.status(201).json({ success: true, responseId: response.id });
}