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
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.prisma = void 0;
// src/index.ts
const hono_1 = require("hono");
const logger_1 = require("hono/logger");
const client_1 = require("@prisma/client");
const categories_1 = require("./routes/categories");
const questions_1 = require("./routes/questions");
const cors_1 = require("hono/cors");
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
exports.app.route('/category', categories_1.categoryRoutes);
exports.app.route('/questions', questions_1.questionRoutes);
// 404 handler
exports.app.notFound((c) => {
    return c.json({ error: 'Not Found' }, 404);
});
// Start the server
const port = parseInt(process.env.PORT || '3000', 10);
console.log(`Server is running on port ${port}`);
exports.default = {
    port,
    fetch: exports.app.fetch
};
