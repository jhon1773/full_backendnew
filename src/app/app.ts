import bodyParser from "body-parser";
import express, { Express } from "express";
import { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { ServerApp } from "../core/server";
import { dbConnection } from "./database/postgres/connection";
import { CONFIG } from "../config";
import { RoutesApi } from "./routes/routes";

// Implementación principal del servidor Express.
// Cumple el contrato ServerApp y encapsula toda la configuración HTTP.
export class Server implements ServerApp {
  app: Express; // instancia de la aplicación Express
  server: any;  // referencia al servidor HTTP, usada para poder cerrarlo

  constructor() {
    this.app = express();
    // Aplica los middlewares base al inicializar
    this.setServerComunication();
    new RoutesApi(this.app);
  }

  // Registra los middlewares necesarios para que el servidor procese peticiones:
  // - body-parser: deserializa el body de las peticiones como JSON
  // - cors: permite peticiones desde otros orígenes (cross-origin)
  protected setServerComunication(): void {
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  async start() {
    // Middleware global que se ejecuta en cada petición entrante.
    // Registra la llamada y propaga errores al manejador de Express.
    this.app.use(async (_, __, next) => {
      try {
        console.log("se ejecuto otro llamado a el servidor desde una ruta");
        await next(null);
      } catch (error) {
        console.log("the error ocurred in the main app");
        next(error);
      }
    })

    // Ruta raíz: entrega el front básico para pruebas
    this.app.get("/", (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, "../public/index.html"));
    });

    // Inicia el servidor HTTP y comienza a escuchar en el puerto configurado
    this.server = this.app.listen(CONFIG.app.port, () => {
      console.log("server started")
    });
  }

  // Cierra el servidor HTTP limpiamente.
  // Útil en tests para liberar el puerto entre ejecuciones.
  async close(): Promise<void> {
    if (this.server) {
      await this.server.close();
    }
  }
}

// Punto de entrada: crea el servidor y, si no estamos en tests, lo inicia y conecta la base de datos
const server = new Server();

if (process.env.NODE_ENV !== 'test') {
  try {
    (async () => {
      await server.start();
      dbConnection();
      console.log(`API listen on ${CONFIG.app.port}`);
    })();

  } catch (error) {
    console.log("error levantando el servidor", { error });
  }
}

export default server;