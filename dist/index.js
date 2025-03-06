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
exports.app = exports.prisma = void 0;
// src/index.ts
const hono_1 = require("hono");
const logger_1 = require("hono/logger");
const client_1 = require("@prisma/client");
const categories_1 = require("./routes/categories");
const questions_1 = require("./routes/questions");
const cors_1 = require("hono/cors");
const node_process_1 = __importDefault(require("node:process"));
const node_server_1 = require("@hono/node-server");
// Create a new Prisma client
exports.prisma = new client_1.PrismaClient();
// Create a Hono app
exports.app = new hono_1.Hono();
// Middleware
exports.app.use('*', (0, logger_1.logger)());
exports.app.use('*', (0, cors_1.cors)());
// Error handler middleware
exports.app.use('*', (c, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            return c.json({ error: error.message || 'Internal Server Error' }, error.name === 'ValidationError' ? 400 : 500);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
}));
// Routes
exports.app.route('/categories', categories_1.categoryRoutes);
exports.app.route('/questions', questions_1.questionRoutes);
// 404 handler
exports.app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});
// Start the server
//const port = parseInt(process.env.PORT || '3000', 10);
//console.log(`Server is running on port ${port}`);
const PORT = Number(node_process_1.default.env.PORT) || 3000;
const HOST = node_process_1.default.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
/*export default {
  PORT,
  fetch: app.fetch
};*/
(0, node_server_1.serve)({
    fetch: exports.app.fetch,
    port: PORT,
    hostname: HOST,
}, () => {
    console.log(`Server running on ${node_process_1.default.env.NODE_ENV === "production"
        ? "https://Vef2-verk3.onrender.com"
        : `http://${HOST}:${PORT}`}`);
});
