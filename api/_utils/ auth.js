import jwt from 'jsonwebtoken';

export function verifyAdmin(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/admin-token=([^;]+)/);
  if (!match) return false;

  try {
    jwt.verify(match[1], process.env.ADMIN_JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}