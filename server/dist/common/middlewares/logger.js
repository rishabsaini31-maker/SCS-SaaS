export function logger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}
//# sourceMappingURL=logger.js.map