import { Request, Response, NextFunction } from 'express';
import { checkToken } from '../helpers/jwt';
import { findBlacklistedToken } from '../repositories/token-blacklist.repository';
import { findUserById } from '../repositories/user.repository';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ ok: false, error_message: 'No se proporcionó token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verifica si el token está en la blacklist (cerró sesión previamente)
    const black = await findBlacklistedToken(token);
    if (black) {
      res.status(401).json({ ok: false, error_message: 'Token inválido o expirado (logout)' });
      return;
    }

    const [valid, result] = checkToken(token);
    if (!valid) {
      res.status(401).json({ ok: false, error_message: 'Token inválido o expirado' });
      return;
    }

    if (typeof result !== 'string') {
      res.status(401).json({ ok: false, error_message: 'Token inválido o expirado' });
      return;
    }

    const user = await findUserById(result);
    if (!user) {
      res.status(401).json({ ok: false, error_message: 'Usuario no encontrado' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ ok: false, error_message: 'Error de autenticación' });
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ ok: false, error_message: 'No autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        ok: false, 
        error_message: 'Acceso denegado: no tienes permisos para este módulo' 
      });
      return;
    }

    next();
  };
}