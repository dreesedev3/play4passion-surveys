import supabase from './_utils/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Access code is required' });
  }

  // Look up the access code
  const { data: accessCode, error } = await supabase
    .from('access_codes')
    .select('*, surveys(*)')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !accessCode) {
    return res.status(404).json({ error: 'Invalid access code' });
  }

  // Check if the survey is active
  if (accessCode.surveys.status !== 'active') {
    return res.status(403).json({ error: 'This survey is no longer active' });
  }

  // Check if code has been used too many times
  if (accessCode.max_uses && accessCode.current_uses >= accessCode.max_uses) {
    return res.status(403).json({ error: 'This access code has reached its usage limit' });
  }

  // Check expiration
  if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
    return res.status(403).json({ error: 'This access code has expired' });
  }

  return res.status(200).json({
    surveyId: accessCode.survey_id,
    surveyTitle: accessCode.surveys.title,
    surveyDescription: accessCode.surveys.description,
  });
}