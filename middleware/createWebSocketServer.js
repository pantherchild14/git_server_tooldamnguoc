import { Server } from "socket.io";
import axios from 'axios';

import { parseXmlToJs, readXmlFile } from "./changeXML.js";
import { xml_odds_change, xml_schedule } from "./xmlMiddleware.js";


const createWebSocketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    const emitOdds = async (socket) => {
        try {
            await xml_odds_change();
            const filePath = "./data_xml/odds_change_data.xml";
            const xmlData = await readXmlFile(filePath);
            const jsData = await parseXmlToJs(xmlData);
            socket.emit("ODDS", JSON.stringify(jsData));
        } catch (error) {
            console.error("Error emitting odds data:", error.message);
            socket.emit("ERROR", "An error occurred while emitting odds data.");
            if (error.message.includes("ETIMEDOUT")) {
                setTimeout(async () => await emitOdds(socket), 5000);
            }
        }
    };



    let isFetchingSchedule = false;
    const emitSchedule = async (socket) => {
        const fetchDataAndEmit = async () => {
            if (!isFetchingSchedule) {
                try {
                    isFetchingSchedule = true;
                    // await xml_schedule();

                    const filePath = "./data_xml/schedule_data.xml";
                    const xmlData = await readXmlFile(filePath);
                    const jsData = await parseXmlToJs(xmlData);
                    socket.emit("SCHEDULE", JSON.stringify(jsData));
                } catch (error) {
                    console.error("Error fetching schedule data:", error.message);
                    socket.emit("ERROR", "An error occurred while fetching schedule data.");
                    if (error.message.includes("ETIMEDOUT")) {
                        setTimeout(async () => await emitSchedule(socket), 5000);
                    }
                } finally {
                    isFetchingSchedule = false;
                }
            }
        }
        fetchDataAndEmit();

    };


    io.on("connection", async (socket) => {
        try {
            await emitOdds(socket);
            await emitSchedule(socket);


            const intervalOdds = await emitOdds(socket);
            const intervalOddsRT = setInterval(async () => await emitOdds(socket), 5000);
            const intervalSchedule = await emitOdds(socket);
            const intervalScheduleRT = setInterval(async () => await emitSchedule(socket), 10000);

            socket.on("message", (message) => {
                console.log("Received message:", message);
            });

            socket.on("disconnect", () => {
                clearInterval(intervalOdds);
                clearInterval(intervalOddsRT);
                clearInterval(intervalSchedule);
                clearInterval(intervalScheduleRT);

            });
        } catch (error) {
            console.error("Error processing socket connection:", error.message);
            socket.emit("ERROR", "An error occurred while processing socket connection.");
        }
    });
};

export { createWebSocketServer };