import { verifyAdmin } from '../_utils/auth.js';

export default async function handler(req, res) {
  if (verifyAdmin(req)) {
    return res.status(200).json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false });
}