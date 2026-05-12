// Importa el paquete jsonwebtoken y su tipo JwtPayload para trabajar con JWT
import jwt, { JwtPayload }  from 'jsonwebtoken';
// Importa la configuración global, donde está la clave secreta JWT
import { CONFIG } from '../../config';

// Define una interfaz para extender el JwtPayload y asegurar que el payload personalizado contiene una propiedad id de tipo string
interface CustomJwtPayload extends JwtPayload {
  id: string;
  role?: string;
  country?: string | null;
}

// Genera un JWT con id, rol y país opcionales. Expira en 48 horas.
export async function generateToken(id: string, role?: string, country?: string | null): Promise<string | undefined> {
  try {
    const payload: Partial<CustomJwtPayload> = { id };
    if (role) payload.role = role;
    if (country !== undefined) payload.country = country;

    const token = jwt.sign(payload as CustomJwtPayload, CONFIG.jwt_key, { expiresIn: '48h' });
    return token;
  } catch (error) {
    console.error('no se pudo generar el jwt', error);
    return undefined;
  }
}

// Función que verifica y decodifica un JWT, retornando un booleano e id de usuario, o un error si la verificación falla
export function checkToken(token: string): [boolean, string | Error] {
  try {
    // Decodifica (y valida) el token usando la clave secreta, asegurando el tipo del payload
    const decoded = jwt.verify(token, CONFIG.jwt_key) as CustomJwtPayload;
    // Si la decodificación fue exitosa y contiene un 'id', retorna true y el 'id'
    if (decoded && decoded.id) {
      return [true, decoded.id];
    }
    // Si el token es válido pero no contiene un 'id', retorna false y un error personalizado
    return [false, new Error('Token does not contain id')];
  } catch (error) {
    // Si ocurre un error (token inválido, expirado, etc.), retorna false y el error capturado
    return [false, error as Error];
  }
}