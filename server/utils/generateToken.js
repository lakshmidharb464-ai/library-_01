import jwt from 'jsonwebtoken';

export const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'nebula-secret-key-2026', {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'nebula-refresh-secret-2026', {
    expiresIn: '7d',
  });
};
