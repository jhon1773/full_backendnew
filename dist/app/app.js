"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const connection_1 = require("./database/postgres/connection");
const config_1 = require("../config");
const routes_1 = require("./routes/routes");
// Implementación principal del servidor Express.
// Cumple el contrato ServerApp y encapsula toda la configuración HTTP.
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        // Aplica los middlewares base al inicializar
        this.setServerComunication();
        new routes_1.RoutesApi(this.app);
    }
    // Registra los middlewares necesarios para que el servidor procese peticiones:
    // - body-parser: deserializa el body de las peticiones como JSON
    // - cors: permite peticiones desde otros orígenes (cross-origin)
    setServerComunication() {
        this.app.use(body_parser_1.default.json());
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            // Middleware global que se ejecuta en cada petición entrante.
            // Registra la llamada y propaga errores al manejador de Express.
            this.app.use((_, __, next) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log("se ejecuto otro llamado a el servidor desde una ruta");
                    yield next(null);
                }
                catch (error) {
                    console.log("the error ocurred in the main app");
                    next(error);
                }
            }));
            // Ruta raíz: entrega el front básico para pruebas
            this.app.get("/", (_req, res) => {
                res.sendFile(path_1.default.join(__dirname, "../public/index.html"));
            });
            // Inicia el servidor HTTP y comienza a escuchar en el puerto configurado
            this.server = this.app.listen(config_1.CONFIG.app.port, () => {
                console.log("server started");
            });
        });
    }
    // Cierra el servidor HTTP limpiamente.
    // Útil en tests para liberar el puerto entre ejecuciones.
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.server) {
                yield this.server.close();
            }
        });
    }
}
exports.Server = Server;
// Punto de entrada: crea el servidor y, si no estamos en tests, lo inicia y conecta la base de datos
const server = new Server();
if (process.env.NODE_ENV !== 'test') {
    try {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            yield server.start();
            (0, connection_1.dbConnection)();
            console.log(`API listen on ${config_1.CONFIG.app.port}`);
        }))();
    }
    catch (error) {
        console.log("error levantando el servidor", { error });
    }
}
exports.default = server;
