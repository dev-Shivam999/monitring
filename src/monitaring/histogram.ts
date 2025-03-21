import { NextFunction, Request, Response } from "express";
import { Histogram } from "prom-client";

export const requestDurationHistogram = new Histogram({
    name: "request_duration",
    help: "Duration of requests in milliseconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000],
});

export const requestDurationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        requestDurationHistogram.observe({
            method: req.method,
            route: req.path,
            status_code: res.statusCode.toString(),
        }, duration);
    });
    next();
};

