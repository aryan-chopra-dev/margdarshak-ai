import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  // Clear the authentication cookies
  response.cookies.delete('user-info');
  response.cookies.delete('auth-token'); // Clear legacy token if it exists
  
  return response;
}
