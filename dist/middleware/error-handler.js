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
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (c, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (error) {
        console.error('Error:', error);
        if (error instanceof zod_1.ZodError) {
            return c.json({ error: 'Validation Error', details: error.errors }, 400);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
exports.errorHandler = errorHandler;
