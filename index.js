import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';

import apiRouter from './routers/apiRouter.js';
import usersRouter from './routers/usersRouter.js';
import { scheduleCron } from './crons/scheduleCron.js';
import { createWebSocketServer } from './middleware/createWebSocketServer.js';
import { getScheduleday1 } from './controllers/scheduleController.js';
import { xml_schedule } from './middleware/xmlMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors());

app.use('/sport/football', apiRouter);
app.use('/api/user', usersRouter);

const server = http.createServer(app);
createWebSocketServer(server);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

scheduleCron();
