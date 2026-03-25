import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: '24h',
  });

  res.setHeader(
    'Set-Cookie',
    `admin-token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400`
  );

  return res.status(200).json({ success: true });
}