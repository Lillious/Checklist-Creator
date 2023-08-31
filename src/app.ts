import express from 'express';
const app = express();
import logger from 'morgan';
import http from 'node:http';
import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';
const port = process.env.PORT || 80;
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View Engine Setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.set('port', port);
const server = http.createServer(app);

// Cluster Setup
if (cluster.isPrimary) {
    // Fork workers
    console.log(`Primary ${process.pid} is running on port ${port}`);
    for (let i = 0; i < os.availableParallelism(); i++) {
        cluster.fork();
    }
    // If a worker dies, create a new one to replace it
    cluster.on('exit', (worker: any) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    server.listen(port, () => {
        console.log(`Worker ${process.pid} started`);
    }).on('error', (error: any) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind = typeof port === 'string' ?
            'Pipe ' + port :
            'Port ' + port;

        switch (error.code) {
            case 'EACCES':
                console.log(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.log(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
}

// Public files
app.use('/', express.static(path.join(__dirname, '../www/public/'), {
    maxAge: 2.88e+7
}));

// API Routes
const baseAPI = '/api/v1';
app.get(`${baseAPI}/status`, (req: any, res: any) => {
    res.setHeader('Cache-Control', 'public, max-age=2.88e+7');
    res.send({status: 'Online'});
});

// Catch 404 and forward to error handler
app.use(function(req: any, res: any) {
    res.setHeader('Cache-Control', 'public, max-age=2.88e+7');
    res.status(404).send({error: `File: ${req.url} not found.`});
});
