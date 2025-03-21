import express from "express";
import { middleware } from "./middkeware";
import { requestCounterMiddleware } from "./monitoring/requestCounter";
import client from "prom-client";
import { activeRequestCounterMiddleware } from "./monitoring/activeRequestCounter";
import { requestDurationMiddleware } from "./monitoring/histogram";
import { makeMultipleRequests } from "./attack";
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    console.log(`Number of CPUs: ${numCPUs}`);

    // Fork workers
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Replace the dead worker
        cluster.fork();
    });
} else {
    // Workers share the TCP connection
    const app = express();
    const PORT = 3000;

    app.use(express.json());
    app.use(middleware);
    app.use(requestCounterMiddleware);
    app.use(activeRequestCounterMiddleware);
    app.use(requestDurationMiddleware);

    const collectMetrics = client.collectDefaultMetrics;
    collectMetrics({ register: client.register });

    app.get("/attack", async (req, res) => {
        let count = 10;
        for (let i = 0; i < count * count; i++) {
            count++;
        }
        res.send("Attack started");
    });

    app.get("/user", (req, res) => {
        res.send({
            name: "John Doe",
            age: 25,
        });
    });

    app.post("/user", (req, res) => {
        const user = req.body;
        res.send({
            ...user,
            id: 1,
        });
    });

    app.get("/metrics", async (req, res) => {
        const metrics = await client.register.metrics();
        res.set("Content-Type", client.register.contentType);
        res.end(metrics);
    });

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started on http://localhost:${PORT}`);
        console.log(`Metrics endpoint available at http://localhost:${PORT}/metrics`);
    });
}