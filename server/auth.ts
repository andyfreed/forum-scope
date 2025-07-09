import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

// Generate a secure secret if not provided
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Log warning if using default secret
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: Using default JWT secret. Set JWT_SECRET environment variable in production!');
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      // Check cookie as fallback
      const cookieToken = req.cookies?.token;
      if (!cookieToken) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const user = verifyToken(cookieToken);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      req.user = user;
      return next();
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
    }
  } else {
    // Check cookie as fallback
    const cookieToken = req.cookies?.token;
    if (cookieToken) {
      const user = verifyToken(cookieToken);
      if (user) {
        req.user = user;
      }
    }
  }
  
  next();
}

export async function signup(email: string, password: string, firstName?: string, lastName?: string) {
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const userId = uuidv4();
  const user = await storage.createUser({
    id: userId,
    email,
    passwordHash,
    firstName,
    lastName,
  });

  // Generate token
  const token = generateToken(user.id, user.email);

  return { user, token };
}

export async function login(email: string, password: string) {
  // Find user
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  if (!user.passwordHash) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  return { user, token };
}