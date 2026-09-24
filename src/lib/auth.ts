import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionPayload {
  userId: string;
  email: string;
  roles: string[];
  role?: string; // The currently active role
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedSecret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  if (payload.role) {
    cookieStore.set('user_role', payload.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return null;
  }

  const session = await verifyToken(token);
  if (!session) return null;

  if (!session.roles) {
    session.roles = (session as any).role ? [(session as any).role] : ['PARTICIPANT'];
  }

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  cookieStore.delete('user_role');
}
