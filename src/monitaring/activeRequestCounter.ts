import { NextFunction, Request, Response } from "express";
import { Gauge } from "prom-client";

export const activeRequestCounter = new Gauge({
    name: "active_requests",
    help: "Number of currently active requests",
    labelNames: ["method", "route"],
});

export const activeRequestCounterMiddleware = (req: Request, res: Response, next: NextFunction) => {

    activeRequestCounter.inc({
        method: req.method,
        route: req.path,
    });
    req.on('end', () => {
        activeRequestCounter.dec({
            method: req.method,
            route: req.path,
        });
    });
    next();
};
