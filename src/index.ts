import express from "express";
import { middleware } from "./middkeware";
import { requestCounterMiddleware } from "./monitaring/requestCounter";
import client from "prom-client";
import { activeRequestCounterMiddleware } from "./monitaring/activeRequestCounter";
import { requestDurationMiddleware } from "./monitaring/histogram";



    // Workers share the TCP connection
    const app = express();
    const PORT = 3000;

    app.use(express.json());
    app.use(middleware);
    app.use(requestCounterMiddleware);
    app.use(activeRequestCounterMiddleware);
    app.use(requestDurationMiddleware);

 

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
