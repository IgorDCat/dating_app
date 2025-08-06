const API_URL = process.env.API_URL || ''

export const checkAuth = async (email: string, password: string): Promise<string | null> => {
  const credentials = btoa(`${email}:${password}`);

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      }
    });

    if (response.ok) {
      return response.headers.get('X-Token');
    }
    return null;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}

export const registerUser = async (email: string, password: string): Promise<string> => {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  const token = response.headers.get('X-Token');
  if (!token) {
    throw new Error('No auth token received');
  }

  return token;
}
