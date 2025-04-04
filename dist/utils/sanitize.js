import xss from 'xss';
export function sanitizeInput(input) {
    return xss(input);
}
export function sanitizeObject(obj) {
    const sanitized = Object.assign({}, obj);
    for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
            sanitized[key] = sanitizeInput(sanitized[key]);
        }
        else if (Array.isArray(sanitized[key])) {
            sanitized[key] = sanitized[key].map((item) => typeof item === 'string' ? sanitizeInput(item) : item);
        }
        else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeObject(sanitized[key]);
        }
    }
    return sanitized;
}
