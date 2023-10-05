import express from "express";
import { crawlScheduleApi } from "../crawlerApi/scheduleApiCrawl.js";
import { crawlOddsApi } from "../crawlerApi/oddsApiCrawl.js";
import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
import { crawlAnalysisMatchApi } from "../crawlerApi/analysisCrawl.js";
import { crawlScheduleSingleApi } from "../crawlerApi/scheduleApiCrawlSingle.js";

const router = express.Router();

router.get(`/schedule/:day`, async (req, res) => {
    try {
        const filePath = "./data_xml/schedule_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const dayTimestamp = parseInt(req.params.day);

        if (isNaN(dayTimestamp)) {
            res.status(400).json({ error: "Invalid timestamp provided" });
            return;
        }

        const matchedItems = scheduleData.filter(item => {
            const matchTime = new Date(item['$']['MATCH_TIME'] * 1000);
            const formattedDate = `${matchTime.getFullYear()}-${(matchTime.getMonth() + 1).toString().padStart(2, '0')}-${matchTime.getDate().toString().padStart(2, '0')}`;
            return formattedDate === req.params.day;
        });

        if (matchedItems.length > 0) {
            res.status(200).json(matchedItems);
        } else {
            res.status(404).json({ error: "Matching items not found" });
        }
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
});

router.get(`/odds`, async (req, res) => {
    try {
        const filePath = "./data_xml/odds_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        res.status(200).json(jsData);
    } catch (error) {
        console.error("Error while emitting status data:", error.message);
        res.status(500).json({ error: "Error while emitting status data" });
    }
});

router.get(`/odds-history`, async (req, res) => {
    try {
        const filePath = "./data_xml/odds_history_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        res.status(200).json(jsData);

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});

router.get(`/detail/:id`, async (req, res) => {
    try {
        const filePath = "./data_xml/detail_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleData = jsData['DETAIL_DATA']['DETAIL_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});

router.get(`/stats/:id`, async (req, res) => {
    try {
        const filePath = "./data_xml/stats_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['STATS_DATA']['STATS_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }

        // res.status(200).json(jsData);

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});

router.get(`/analysis/:id`, async (req, res) => {
    const id = req.params.id;

    const matchedItem = await crawlAnalysisMatchApi(id)

    if (matchedItem) {
        res.status(200).json(matchedItem);
    } else {
        res.status(404).json({ error: "Matching item not found" });
    }
});

router.get(`/scheduleSingle/:id`, async (req, res) => {
    const id = req.params.id;

    const matchedItem = await crawlScheduleSingleApi(id)

    if (matchedItem) {
        res.status(200).json(matchedItem);
    } else {
        res.status(404).json({ error: "Matching item not found" });
    }
});

router.get(`/odds_history/:id`, async (req, res) => {
    try {
        const filePath = "./data_xml/odds_history_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleData = jsData['ODDS_HISTORY_DATA']['ODDS_HISTORY_ITEM'];

        const id = req.params.id;

        const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

        if (matchedItem) {
            res.status(200).json(matchedItem);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});

router.get(`/odds_history`, async (req, res) => {
    try {
        const filePath = "./data_xml/odds_history_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        res.status(200).json(jsData);

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});

/* ---------------------------------------------- */
export default router;