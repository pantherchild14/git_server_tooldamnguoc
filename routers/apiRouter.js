import express from "express";
import { crawlScheduleApi } from "../crawlerApi/scheduleApiCrawl.js";
import { crawlOddsApi } from "../crawlerApi/oddsApiCrawl.js";
import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
import { crawlAnalysisMatchApi } from "../crawlerApi/analysisCrawl.js";
import { crawlScheduleSingleApi } from "../crawlerApi/scheduleApiCrawlSingle.js";
import connection from "../configs/mysqlDb.js";

const router = express.Router();

function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function filterByCustomCondition(scheduleData, targetDate) {

    return scheduleData.filter(item => {
        const startDate = new Date(targetDate);
        startDate.setUTCHours(startDate.getUTCHours());

        const endDate = new Date(startDate);
        endDate.setUTCDate(startDate.getUTCDate() + 1);
        endDate.setUTCHours(5, 0, 0, 0);

        const matchTime = new Date(item['$']['MATCH_TIME'] * 1000);
        const formattedDate = `${matchTime.getFullYear()}-${(matchTime.getMonth() + 1).toString().padStart(2, '0')}-${matchTime.getDate().toString().padStart(2, '0')} ${matchTime.getHours().toString().padStart(2, '0')}:${matchTime.getMinutes().toString().padStart(2, '0')}:${matchTime.getSeconds().toString().padStart(2, '0')}`;

        return formattedDate >= formatDate(startDate) && formattedDate <= formatDate(endDate);
    });
}

router.get(`/schedule/:day`, async (req, res) => {
    try {
        const { day } = req.params;
        const currentDate = new Date(`${day}T00:00:00Z`);
        const timestamp = currentDate.toISOString();
        const filePath = "./data_xml/schedule_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const dayTimestamp = parseInt(timestamp);


        if (isNaN(dayTimestamp)) {
            res.status(400).json({ error: "Invalid timestamp provided" });
            return;
        }

        const matchedItems = filterByCustomCondition(scheduleData, day);

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

router.get(`/schedules`, async (req, res) => {
    try {
        const filePath = "./data_xml/schedule_3_day.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);
        const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const currentTime = new Date();
        const currentTimeVN = new Date(currentTime.getTime());

        const currentHours = currentTimeVN.getHours();

        if (currentHours < 12) {
            currentTimeVN.setDate(currentTimeVN.getDate() - 1);
        }

        let afterDay;

        const month = String(currentTimeVN.getMonth() + 1).padStart(2, '0');
        const day = String(currentTimeVN.getDate()).padStart(2, '0');
        const year = currentTimeVN.getFullYear();
        const today = `${year}-${month}-${day} 12:00:00`;

        const nextDay = new Date(currentTimeVN);
        nextDay.setDate(nextDay.getDate() + 1);

        if (nextDay.getMonth() !== currentTimeVN.getMonth()) {
            const nextMonth = String(nextDay.getMonth() + 1).padStart(2, '0');
            const nextDayDate = String(nextDay.getDate()).padStart(2, '0');
            afterDay = `${nextDay.getFullYear()}-${nextMonth}-${nextDayDate} 12:00:00`;
        } else {
            const nextDayDate = String(nextDay.getDate()).padStart(2, '0');
            afterDay = `${year}-${month}-${nextDayDate} 12:00:00`;
        }



        const startTimestamp = new Date(today).getTime() / 1000;
        const endTimestamp = new Date(afterDay).getTime() / 1000;

        const matchedItems = scheduleData.filter(item => item['$']['MATCH_TIME'] >= startTimestamp && item['$']['MATCH_TIME'] <= endTimestamp);


        if (matchedItems) {
            res.status(200).json(matchedItems);
        } else {
            res.status(404).json({ error: "Matching item not found" });
        }
    } catch (error) {
        console.error("Error while fetching data by date range: ", error);
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

        const historyData = jsData['ODDS_HISTORY_DATA']['ODDS_HISTORY_ITEM'];

        const filteredItems = {
            HANDICAP_ITEM: [],
            EUROPE_ITEM: [],
            OVER_UNDER_ITEM: [],
        };

        historyData.forEach((item) => {
            const handicapItems = item['HANDICAP_ITEM'];
            const europeItems = item['EUROPE_ITEM'];
            const overItems = item['OVER_UNDER_ITEM'];

            const findLargestChangeTime = (items) => {
                return items.reduce((maxItem, currentItem) => {
                    const maxChangeTime = parseInt(maxItem['$']['CHANGE_TIME']);
                    const currentChangeTime = parseInt(currentItem['$']['CHANGE_TIME']);
                    return currentChangeTime > maxChangeTime ? currentItem : maxItem;
                });
            };

            if (handicapItems) {
                const filteredHandicapItems = handicapItems.filter((handicapItem) => {
                    return handicapItem['$']['ODDS_TYPE'] === '2';
                });

                if (filteredHandicapItems.length > 0) {
                    const largestChangeTimeHandicapItem = findLargestChangeTime(filteredHandicapItems);
                    filteredItems.HANDICAP_ITEM.push(largestChangeTimeHandicapItem);
                }
            }

            if (europeItems) {
                const filteredEuropeItems = europeItems.filter((europeItem) => {
                    return europeItem['$']['ODDS_TYPE'] === '2';
                });

                if (filteredEuropeItems.length > 0) {
                    const largestChangeTimeEuropeItem = findLargestChangeTime(filteredEuropeItems);
                    filteredItems.EUROPE_ITEM.push(largestChangeTimeEuropeItem);
                }
            }

            if (overItems) {
                const filteredOverItems = overItems.filter((overItem) => {
                    return overItem['$']['ODDS_TYPE'] === '2';
                });

                if (filteredOverItems.length > 0) {
                    const largestChangeTimeOverItem = findLargestChangeTime(filteredOverItems);
                    filteredItems.OVER_UNDER_ITEM.push(largestChangeTimeOverItem);
                }
            }
        });


        res.status(200).json(filteredItems);

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

// router.get(`/scheduleSingle/:id`, async (req, res) => {
//     const id = req.params.id;

//     const query = `
//         SELECT *
//         FROM schedule
//         WHERE MATCH_ID = ?;
//     `;

//     connection.query(query, [id], async (err, results) => {
//         if (err) {
//             console.error('Lỗi truy vấn DB:', err);
//             res.status(500).json({ error: "Error querying the database" });
//         } else {
//             if (results.length > 0) {
//                 res.status(200).json(results);
//             } else {
//                 res.status(404).json({ error: "Matching item not found" });
//             }
//         }
//     });
// });


router.get(`/scheduleSingle/:id`, async (req, res) => {
    const filePath = "./data_xml/schedule_3_day.xml";
    const xmlData = await readXmlFile(filePath);
    const jsData = await parseXmlToJs(xmlData);

    const scheduleData = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

    const id = req.params.id;

    const matchedItem = scheduleData.find(item => item['$']['MATCH_ID'] === id);

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

router.get(`/detail`, async (req, res) => {
    try {
        const filePath = "./data_xml/detail_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        res.status(200).json(jsData);

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});


router.get(`/stats`, async (req, res) => {
    try {
        const filePath = "./data_xml/stats_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        res.status(200).json(jsData);

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
        res.status(500).json({ error: "Lỗi trong quá trình xử lý dữ liệu" });
    }
});

router.get(`/analysis`, async (req, res) => {
    try {
        const filePath = "./data_xml/analysis_data.xml";
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