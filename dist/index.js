"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.prisma = void 0;
// src/index.ts
const hono_1 = require("hono");
const client_1 = require("@prisma/client");
const categories_1 = require("./routes/categories");
const questions_1 = require("./routes/questions");
const node_process_1 = __importDefault(require("node:process"));
const node_server_1 = require("@hono/node-server");
const cors_1 = require("hono/cors");
const serve_static_1 = require("@hono/node-server/serve-static");
exports.prisma = new client_1.PrismaClient();
exports.app = new hono_1.Hono();
exports.app.use('/*', (0, cors_1.cors)());
exports.app.use('/static/*', (0, serve_static_1.serveStatic)({ root: './' }));
exports.app.use('/', (0, serve_static_1.serveStatic)({ path: './public/index.html' }));
exports.app.route('/categories', categories_1.categoryRoutes);
exports.app.route('/questions', questions_1.questionRoutes);
const PORT = node_process_1.default.env.PORT ? Number(node_process_1.default.env.PORT) : 3000;
const HOST = node_process_1.default.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
(0, node_server_1.serve)({
    fetch: exports.app.fetch,
    port: PORT !== null && PORT !== void 0 ? PORT : 3000,
    hostname: HOST,
}, (info) => {
    console.log(`Server running on ${node_process_1.default.env.NODE_ENV === "production"
        ? "https://vef2-v3-thb0.onrender.com"
        : `http://${HOST}:${info.port}`}`);
});
