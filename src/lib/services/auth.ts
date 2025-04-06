interface ChallengeResponse {
  challenge: string;
  expiresAt: string;
}

interface VerifyResponse {
  token: string;
  user: {
    id: string;
    wallet_address: string;
    username: string;
    avatar_url: string;
    created_at: string;
    updated_at: string;
  };
}

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined';

/**
 * Request a challenge from the backend for wallet signature
 * @param walletAddress The Solana wallet address
 * @returns Challenge and expiration
 */
export async function requestChallenge(walletAddress: string): Promise<ChallengeResponse> {
  try {
    // Use the environment variable for the API URL, with a fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    console.log('Requesting challenge with API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/v1/auth/challenge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        walletAddress
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Challenge request failed:', response.status, errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      challenge: data.challenge,
      expiresAt: data.expiresAt
    };
  } catch (error) {
    console.error('Error requesting challenge:', error);
    throw error;
  }
}

/**
 * Verify the wallet signature with the backend
 * @param walletAddress The Solana wallet address
 * @param signature The signature in Base58 format
 * @param challenge The challenge string
 * @returns Authentication token and user data
 */
export async function verifySignature(
  walletAddress: string, 
  signature: string, 
  challenge: string
): Promise<VerifyResponse> {
  try {
    // Use the environment variable for the API URL, with a fallback
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    console.log('Verifying signature with API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        walletAddress,
        signature,
        challenge
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Signature verification failed:', response.status, errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Error verifying signature:', error);
    throw error;
  }
}

/**
 * Save authentication token to localStorage
 * @param token JWT token
 */
export function saveAuthToken(token: string): void {
  if (isClient) {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Get the saved authentication token
 * @returns JWT token
 */
export function getAuthToken(): string | null {
  if (!isClient) {
    return null;
  }
  return localStorage.getItem('auth_token');
}

/**
 * Remove the authentication token (logout)
 */
export function removeAuthToken(): void {
  if (isClient) {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Check if the user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Get current user data
 * @returns User data
 */
export async function getUser(): Promise<any> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const response = await fetch(`${apiUrl}/v1/auth/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get user request failed:', response.status, errorText);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.user;
}

/**
 * Make an authenticated API request
 * @param url API endpoint
 * @param method HTTP method
 * @param data Request data
 * @returns API response
 */
export async function authenticatedRequest<T>(
  url: string, 
  method: string = 'GET', 
  data?: Record<string, unknown>
): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  // If the URL doesn't start with http, prepend the API URL
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${process.env.NEXT_PUBLIC_API_URL}${url.startsWith('/') ? url : `/${url}`}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    credentials: 'include'
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(fullUrl, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API request failed:', response.status, errorText);
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
} 