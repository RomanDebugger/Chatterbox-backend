export const ERRORS = {
  INVALID_CREDENTIALS: { code: 401, message: 'Invalid credentials' },
  UNAUTHORIZED: { code: 401, message: 'Missing or invalid authorization header' },
  FORBIDDEN_USER: { code: 403, message: 'Invalid or inactive user' },
  USERNAME_EXISTS: { code: 400, message: 'Username already exists' },
  USERNAME_NOT_ALLOWED: { code: 400, message: 'Username not allowed' },
  USERNAME_INVALID: { code: 400, message: 'Username must be 3-20 lowercase letters, numbers, or underscores' },
  WEAK_PASSWORD: { code: 400, message: 'Password must be at least 6 characters' },
  SERVER_ERROR: { code: 500, message: 'Internal Server error' },
  TOO_MANY_REQUESTS: { code: 429, message: 'Too many login/signup, please try again later.' },
  DB_CONNECT_FAIL: { code: 500, message: 'Database connection failed' },
};

export const errorResponse = (res, error = ERRORS.SERVER_ERROR) => {
  return res.status(error.code).json({  
    success: false,
    message: error.message,
    code: error.code
  });
};

