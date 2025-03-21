import { NextFunction, Request, Response } from "express";
import { Counter } from "prom-client";

export const requestCounter = new Counter({
    name: "total_requests",
    help: "Total number of requests processed",
    labelNames: ["method", "route", "status_code"],
});

export const requestCounterMiddleware = (req: Request, res: Response, next: NextFunction) => {

    requestCounter.inc({
        method: req.method,
        route: req.path,
    });
    next();
};
