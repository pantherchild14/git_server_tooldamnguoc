import { addHours } from "date-fns";
import { format } from 'date-fns-tz';

import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
import { crawlOddsApi } from "../crawlerApi/oddsApiCrawl.js";
import connection from "../configs/mysqlDb.js";
import { crawlDetailMatchApi } from "../crawlerApi/detailMatchApiCrawl.js";
import { crawlStatisticsMatchApi } from "../crawlerApi/statisticsMatchCrawl.js";
import { crawlOddsChangeApi } from "../crawlerApi/oddsChangeApiCrawl.js";
import { crawlScheduleSingleApi } from "../crawlerApi/scheduleApiCrawlSingle.js";


const getOddsXML = async () => {
    try {
        const odds = await crawlOddsApi();

        return odds;
    } catch (error) {
        return Promise.resolve([]);
    }
};

const getOddsChangeXML = async () => {
    try {
        const odds = await crawlOddsChangeApi();

        return odds;
    } catch (error) {
        return Promise.resolve([]);
    }
};

const saveDataToXml = async () => {
    try {
        const filePath = "./data_xml/schedule_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const dataJS = jsData['SCHEDULE_DATA']['SCHEDULE_ITEM'];

        const updatePromises = dataJS.map((match) => {
            return new Promise((resolve, reject) => {
                const matchID = match.$.MATCH_ID;
                const queryHandicap = `SELECT * FROM handicap WHERE MATCH_ID = ?`;
                const queryOverUnder = `SELECT * FROM overunder WHERE MATCH_ID = ?`;
                const queryEurope = `SELECT * FROM europe WHERE MATCH_ID = ?`;

                const matchData = {
                    handicap: [],
                    overunder: [],
                    europe: []
                };

                connection.query(queryHandicap, [matchID], (error, handicapResults) => {
                    if (error) {
                        console.error('Lỗi truy vấn cơ sở dữ liệu handicap: ' + error.message);
                        reject(error);
                    } else {
                        matchData.handicap = handicapResults || [];

                        connection.query(queryOverUnder, [matchID], (error, overUnderResults) => {
                            if (error) {
                                console.error('Lỗi truy vấn cơ sở dữ liệu overunder: ' + error.message);
                                reject(error);
                            } else {
                                matchData.overunder = overUnderResults || [];

                                connection.query(queryEurope, [matchID], (error, europeResults) => {
                                    if (error) {
                                        console.error('Lỗi truy vấn cơ sở dữ liệu europe: ' + error.message);
                                        reject(error);
                                    } else {
                                        matchData.europe = europeResults || [];
                                        resolve(matchData);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });

        const matchDatas = await Promise.all(updatePromises);

        // Gộp các bản ghi có cùng MATCH_ID vào một mảng
        const groupedMatches = {};

        matchDatas.forEach((matchData) => {
            if (matchData.handicap.length > 0) {
                const matchID = matchData.handicap[0].MATCH_ID;
                if (!groupedMatches[matchID]) {
                    groupedMatches[matchID] = {
                        handicap: [],
                        overunder: [],
                        europe: []
                    };
                }
                groupedMatches[matchID].handicap = groupedMatches[matchID].handicap.concat(matchData.handicap);
            }
            if (matchData.overunder.length > 0) {
                const matchID = matchData.overunder[0].MATCH_ID;
                if (!groupedMatches[matchID]) {
                    groupedMatches[matchID] = {
                        handicap: [],
                        overunder: [],
                        europe: []
                    };
                }
                groupedMatches[matchID].overunder = groupedMatches[matchID].overunder.concat(matchData.overunder);
            }
            if (matchData.europe.length > 0) {
                const matchID = matchData.europe[0].MATCH_ID;
                if (!groupedMatches[matchID]) {
                    groupedMatches[matchID] = {
                        handicap: [],
                        overunder: [],
                        europe: []
                    };
                }
                groupedMatches[matchID].europe = groupedMatches[matchID].europe.concat(matchData.europe);
            }
        });

        // Hiển thị kết quả gộp
        return groupedMatches;

    } catch (error) {
        console.error("Lỗi trong quá trình xử lý dữ liệu: " + error.message);
    }
}

const getDetailMatchXML = async () => {
    try {
        const detail = await crawlDetailMatchApi();

        return detail;
    } catch (error) {
        return Promise.resolve([]);
    }
}

const getStatictiscMatchXML = async () => {
    try {
        const stats = await crawlStatisticsMatchApi();

        return stats;
    } catch (error) {
        return Promise.resolve([]);
    }
}


export {
    getOddsXML,
    saveDataToXml,
    getDetailMatchXML,
    getStatictiscMatchXML,
    getOddsChangeXML,
};