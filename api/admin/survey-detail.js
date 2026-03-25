import supabase from '../_utils/supabase.js';
import { verifyAdmin } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, action } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Survey ID is required' });
  }

  // PATCH — Update survey status
  if (req.method === 'PATCH') {
    const { status } = req.body;
    const { data, error } = await supabase
      .from('surveys')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // DELETE — Soft delete
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('surveys')
      .update({ is_deleted: true })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}