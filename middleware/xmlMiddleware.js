import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";

import { crawlScheduleApi } from "../crawlerApi/scheduleApiCrawl.js";
import { getDetailMatchXML, getOddsChangeXML, getOddsXML, getStatictiscMatchXML, saveDataToXml } from "../controllers/xmlController.js";

const xml_schedule = async (req, res, next) => {
    try {
        const currentDate = new Date();

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const formattedDate = formatDate(currentDate);
        const results = await crawlScheduleApi(formattedDate);

        const scheduleArray = Array.isArray(results) ? results : [results];

        const root = xmlbuilder.create("SCHEDULE_DATA");
        scheduleArray.forEach((item) => {
            const oddsItem = root.ele("SCHEDULE_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }
        const filePath = "./data_xml/schedule_data.xml";
        await fs.writeFile(filePath, xmlString);
    } catch (error) {
        console.error("Error crawl schedule xml : ", error);
    }
};

const xml_schedule_yesterday = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);

        function formatDate(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const formattedDate = formatDate(yesterday); // Sử dụng ngày hôm qua
        const results = await crawlScheduleApi(formattedDate);

        const scheduleArray = Array.isArray(results) ? results : [results];

        const root = xmlbuilder.create("SCHEDULE_DATA");
        scheduleArray.forEach((item) => {
            const oddsItem = root.ele("SCHEDULE_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }
        const filePath = "./data_xml/schedule_yesterday_data.xml";
        await fs.writeFile(filePath, xmlString);
    } catch (error) {
        console.error("Error crawl schedule xml : ", error);
    }
};


const xml_odds = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getOddsXML();
        } catch (error) {
            console.error("Error fetching odds data: ", error);
            return;
        }

        const oddsArray = Array.isArray(data) ? data : [data];

        const root = xmlbuilder.create("ODDS_DATA");

        oddsArray.forEach((item) => {
            const oddsItem = root.ele("ODDS_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/odds_data.xml";
        await fs.writeFile(filePath, xmlString);
    } catch (error) {
        return;
    }
};

const xml_odds_change = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getOddsChangeXML();
        } catch (error) {
            console.error("Error fetching odds data: ", error);
            return;
        }

        const oddsArray = Array.isArray(data) ? data : [data];

        const root = xmlbuilder.create("ODDS_DATA");

        oddsArray.forEach((item) => {
            const oddsItem = root.ele("ODDS_ITEM");
            Object.keys(item).forEach((key) => {
                oddsItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/odds_change_data.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        return;
    }
};

const xml_odds_history = async (req, res, next) => {
    try {
        const filePath = './data_xml/odds_history_data.xml';

        const groupedMatches = await saveDataToXml();

        const root = xmlbuilder.create('ODDS_HISTORY_DATA');

        Object.keys(groupedMatches).forEach((matchID) => {
            const match = groupedMatches[matchID];

            const oddsItem = root.ele('ODDS_HISTORY_ITEM', { MATCH_ID: matchID }); // Thêm MATCH_ID vào ODDS_HISTORY_ITEM

            if (match.handicap) {
                match.handicap.forEach((item) => {
                    const handicapItem = oddsItem.ele('HANDICAP_ITEM');
                    Object.keys(item).forEach((key) => {
                        handicapItem.att(key, item[key]);
                    });
                });
            }

            if (match.overunder) {
                match.overunder.forEach((item) => {
                    const overunderItem = oddsItem.ele('OVER_UNDER_ITEM');
                    Object.keys(item).forEach((key) => {
                        overunderItem.att(key, item[key]);
                    });
                });
            }

            if (match.europe) {
                match.europe.forEach((item) => {
                    const europeItem = oddsItem.ele('EUROPE_ITEM');
                    Object.keys(item).forEach((key) => {
                        europeItem.att(key, item[key]);
                    });
                });
            }
        });

        const xmlString = root.end({ pretty: true });

        try {
            await fs.access(filePath);
        } catch (err) {
            await fs.mkdir(filePath);
        }

        await fs.writeFile(filePath, xmlString);
        console.log('XML file successfully generated.');
    } catch (error) {
        console.error('Lỗi trong quá trình xử lý dữ liệu và lưu trữ XML: ' + error.message);
    }
};



const xml_detail_match = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getDetailMatchXML();
        } catch (error) {
            console.error("Error fetching detail data: ", error);
            return;
        }

        const detailArray = Array.isArray(data) ? data : [data];

        const root = xmlbuilder.create("DETAIL_DATA");

        detailArray.forEach((item) => {
            const detaiItem = root.ele("DETAIL_ITEM");
            Object.keys(item).forEach((key) => {
                detaiItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/detail_data.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        return;
    }
}

const xml_statistics_match = async (req, res, next) => {
    try {
        let data;
        try {
            data = await getStatictiscMatchXML();
        } catch (error) {
            console.error("Error fetching detail data: ", error);
            return;
        }

        const detailArray = Array.isArray(data) ? data : [data];

        const root = xmlbuilder.create("STATS_DATA");

        detailArray.forEach((item) => {
            const detaiItem = root.ele("STATS_ITEM");
            Object.keys(item).forEach((key) => {
                detaiItem.att(key, item[key]);
            });
        });
        const xmlString = root.end({ pretty: true });
        const folderPath = "./data_xml";
        try {
            await fs.access(folderPath);
        } catch (err) {
            await fs.mkdir(folderPath);
        }

        const filePath = "./data_xml/stats_data.xml";
        await fs.writeFile(filePath, xmlString);
        console.log("XML file successfully generated.");
    } catch (error) {
        return;
    }
}

export {
    xml_schedule,
    xml_odds,
    xml_odds_history,
    xml_schedule_yesterday,
    xml_detail_match,
    xml_statistics_match,
    xml_odds_change
};