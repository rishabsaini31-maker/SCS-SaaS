const rateLimitWindowMs = 15 * 60 * 1000; // 15 minutes
const maxRequests = 100;
const ipRequestCounts = {};
export function rateLimiter(req, res, next) {
    const ip = req.ip || "unknown";
    const now = Date.now();
    let entry;
    if (!Object.prototype.hasOwnProperty.call(ipRequestCounts, ip) ||
        now - ipRequestCounts[ip].startTime > rateLimitWindowMs) {
        entry = { count: 1, startTime: now };
    }
    else {
        entry = {
            count: ipRequestCounts[ip].count + 1,
            startTime: ipRequestCounts[ip].startTime,
        };
    }
    ipRequestCounts[ip] = entry;
    if (entry.count > maxRequests) {
        return res
            .status(429)
            .json({ error: "Too many requests, please try again later." });
    }
    next();
}
//# sourceMappingURL=rateLimiter.js.map