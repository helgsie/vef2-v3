"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.prisma = void 0;
// src/index.ts
const hono_1 = require("hono");
const client_1 = require("@prisma/client");
const node_process_1 = __importDefault(require("node:process"));
const node_server_1 = require("@hono/node-server");
exports.prisma = new client_1.PrismaClient();
exports.app = new hono_1.Hono();
/*app.use('*', async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Error) {
      return c.json(
        { error: error.message || 'Internal Server Error' },
        error.name === 'ValidationError' ? 400 : 500
      );
    }
    
    return c.json(
      { error: 'Internal Server Error' },
      500
    );
  }
});*/
/*app.route('/categories', categoryRoutes);
app.route('/questions', questionRoutes);*/
const PORT = Number(node_process_1.default.env.PORT) || 3000;
const HOST = node_process_1.default.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
(0, node_server_1.serve)({
    fetch: exports.app.fetch,
    port: PORT,
    hostname: HOST,
}, (info) => {
    console.log(`Server running on ${node_process_1.default.env.NODE_ENV === "production"
        ? "https://vef2-v3-thb0.onrender.com"
        : `https://${HOST}:${info.port}`}`);
});
