import { Request, Response } from "express";
import { CustomResponse, User, UserService } from "../interfaces/user";
import bycrypt from 'bcryptjs';
import { generateToken } from "../../helpers/jwt";
import {
    createUser,
    findUserByEmail,
    findUserByPhone,
    UserRow,
    toPublicUser,
    listUsers,
} from "../../repositories/user.repository";
import { addBlacklistedToken } from "../../repositories/token-blacklist.repository";
import { getAllowedModules } from "../permissions";

export type UserResponse = CustomResponse<User>;

export class UserController implements UserService<UserResponse> {
    private buildSessionResponse(user: ReturnType<typeof toPublicUser>, token?: string) {
        return {
            ok: true,
            message: token ? 'usuario logeado' : 'sesión activa',
            user,
            token,
            modules: getAllowedModules(user.role),
        };
    }

    
    public async create(req: Request, res: Response): Promise<UserResponse> {
        // let  name = req.body.name;
        let { email, phone, password } : { email: string, phone: string, password: string } = req.body; 

        try {
            const isSuperadmin = !!(req.user && req.user.role === 'superadmin');
            const requestedRole = req.body.role || 'editor';

            // Si el request no está autenticado: registro público para usuarios normales
            if (!req.user) {
                if (requestedRole !== 'editor') {
                    return res.status(403).json({ ok: false, error_message: 'Acceso denegado: solo superadmin puede crear administradores' });
                }
                // require country for normal users to keep them organized por país
                if (!req.body.country) {
                    return res.status(400).json({ ok: false, error_message: 'El país es obligatorio para el registro' });
                }
            } else {
                // Si está autenticado pero no es superadmin, no puede crear usuarios
                if (!isSuperadmin) {
                    return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
                }
                // Si es superadmin y crea admin_pais, se requiere country
                if (requestedRole === 'admin_pais' && !req.body.country) {
                    return res.status(400).json({ ok: false, error_message: 'El país es obligatorio para crear un admin' });
                }
            }
            const find_email: UserRow | null = await findUserByEmail(email);
            if (find_email) return res.status(400).json({ok: false, error_message: 'este correo ya esta registrado'}); 

            const find_phone: UserRow | null = await findUserByPhone(phone);
            if (find_phone) return res.status(400).json({ok: false, error_message: 'este numero de telefono ya esta registrado'}); 

            const salt =  bycrypt.genSaltSync(10);
            password = bycrypt.hashSync(password, salt);

            const user: User = {
                name: req.body.name,
                email,
                phone,
                password,
                role: req.body.role || 'editor',
                country: req.body.country || null,
            }

            const user_model = await createUser({ ...user });

            // Si es registro público, generar token y devolver sesión
            if (!req.user) {
                const token = await generateToken(user_model.id, user_model.role, user_model.country);
                return res.status(200).json({
                    message: 'User created successfully',
                    user: toPublicUser(user_model),
                    token,
                    modules: getAllowedModules(user_model.role),
                });
            }

            // Creación por superadmin: no generar token automático
            return res.status(200).json({
                message: 'User created successfully',
                user: toPublicUser(user_model),
                modules: getAllowedModules(user_model.role),
            });

        } catch (error) {
            console.error('error al crear el usuario', error);
            return res.status(400).json({ok: false, error_message: 'error al crear el usuario'});
        }
    }

    async list(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }

            const country = req.user.role === 'superadmin' ? (typeof req.query.country === 'string' ? req.query.country : undefined) : (req.user.country ?? undefined);
            const users = await listUsers({ country: country ?? undefined });
            // ocultar contraseñas
            const publicUsers = users.map((u) => toPublicUser(u));
            return res.status(200).json({ ok: true, users: publicUsers });
        } catch (error) {
            console.error('error listando usuarios', error);
            return res.status(500).json({ ok: false, error_message: 'Error listando usuarios' });
        }
    }



    async login(req: Request, res: Response): Promise<CustomResponse<UserResponse>> {
        const { email, password } = req.body;
        try {
            const find_user = await findUserByEmail(email);
            if (!find_user) return res.status(400).json({ok: false, error_message: 'email no encontrado'});
            
            const validPassword = bycrypt.compareSync(password, find_user.password);
            if (!validPassword) return res.status(400).json({ok: false, error_message: 'la contraseña no es valida'});

            const token = await generateToken(find_user.id, find_user.role, find_user.country);
            return res.status(200).json(this.buildSessionResponse(toPublicUser(find_user), token));
        } catch (error) {
            console.error('error en el login', error);
            return res.status(400).json({ok: false, error_message: `error al intentar logearse ${error}`});
        }
    }


    async me(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.user) {
                return res.status(401).json({ ok: false, error_message: 'No autenticado' });
            }

            return res.status(200).json(this.buildSessionResponse(toPublicUser(req.user)));
        } catch (error) {
            console.error('error obteniendo la sesión actual', error);
            return res.status(500).json({ ok: false, error_message: 'Error obteniendo la sesión actual' });
        }
    }


    async logout(req: Request, res: Response): Promise<any> {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(401).json({ ok: false, error_message: 'No se proporcionó token' });

            const token = authHeader.split(' ')[1];
            // decodificar el token para obtener su expiración
            const decoded: any = await import('jsonwebtoken').then(m => m.decode(token));
            const exp = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 1000 * 60 * 60 * 48);

            // guardar en blacklist
            await addBlacklistedToken(token, exp);

            return res.status(200).json({ ok: true, message: 'Sesión cerrada' });
        } catch (error) {
            console.error('error en logout', error);
            return res.status(500).json({ ok: false, error_message: 'Error cerrando sesión' });
        }
    }


    // getUserCredentials(req: Request, res: Response): Promise<Response<User>> {
    //     throw new Error("Method not implemented.");
    // }

}