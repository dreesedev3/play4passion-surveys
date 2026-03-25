import supabase from '../_utils/supabase.js';
import { verifyAdmin } from '../_utils/auth.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET — List codes for a survey
  if (req.method === 'GET') {
    const { surveyId } = req.query;
    if (!surveyId) {
      return res.status(400).json({ error: 'Survey ID is required' });
    }

    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST — Generate new codes
  if (req.method === 'POST') {
    const { surveyId, count = 1, maxUses = null, expiresAt = null } = req.body;

    if (!surveyId) {
      return res.status(400).json({ error: 'Survey ID is required' });
    }

    const codes = [];
    for (let i = 0; i < Math.min(count, 100); i++) {
      codes.push({
        survey_id: surveyId,
        code: generateCode(),
        max_uses: maxUses,
        expires_at: expiresAt,
      });
    }

    const { data, error } = await supabase
      .from('access_codes')
      .insert(codes)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}