import { addHours } from "date-fns";
import { format } from 'date-fns-tz';

import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
import connection from "../configs/mysqlDb.js";
import { crawlOddsChangeAllApi } from "../crawlerApi/oddsChangeAllApiCrawl.js";


// const getOdds = async () => {
//     try {
//         const filePath = "./data_xml/odds_change_data.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);

//         const oddsItem = jsData.ODDS_DATA.ODDS_ITEM;

//         oddsItem.forEach(async (item) => {
//             if (item?.$?.handicap) {
//                 const handicapData = JSON.parse(item.$.handicap);
//                 const CHANGETIME_HANDICAP = handicapData.CHANGE_TIME;

//                 // Kiểm tra và thêm dữ liệu vào bảng handicap
//                 const checkQueryHandicap = `
//                     SELECT COUNT(*) as count
//                     FROM handicap
//                     WHERE CHANGE_TIME = ?;
//                 `;

//                 connection.query(checkQueryHandicap, [CHANGETIME_HANDICAP], (err, results) => {
//                     if (err) {
//                         console.error('Lỗi kiểm tra CHANGE_TIME:', err);
//                     } else {
//                         const count = results[0].count;
//                         if (count === 0) {
//                             // MATCH_ID chưa tồn tại, thêm dữ liệu mới
//                             const insertQuery = `
//                                 INSERT INTO handicap (MATCH_ID, COMPANY_ID, INITIAL_HANDICAP, INITIAL_HOME, INITIAL_AWAY, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValues = [
//                                 handicapData.MATCH_ID,
//                                 handicapData.COMPANY_ID,
//                                 handicapData.INITIAL_HANDICAP,
//                                 handicapData.INITIAL_HOME,
//                                 handicapData.INITIAL_AWAY,
//                                 handicapData.INSTANT_HANDICAP,
//                                 handicapData.INSTANT_HOME,
//                                 handicapData.INSTANT_AWAY,
//                                 handicapData.IN_PLAY,
//                                 CHANGETIME_HANDICAP,
//                                 handicapData.ODDS_TYPE,
//                             ];

//                             connection.query(insertQuery, insertValues, (err, insertResults) => {
//                                 if (err) {
//                                     console.error('Lỗi thêm dữ liệu:', err);
//                                 }

//                             });
//                         }

//                     }
//                 });
//             }

//             if (item?.$?.europe) {
//                 const europeData = JSON.parse(item.$.europe);
//                 const CHANGETIME_EUROPE = europeData.CHANGE_TIME;
//                 // Kiểm tra và thêm dữ liệu vào bảng europe
//                 const checkQueryEurope = `
//                     SELECT COUNT(*) as count
//                     FROM europe
//                     WHERE CHANGE_TIME = ?;
//                 `;
//                 connection.query(checkQueryEurope, [CHANGETIME_EUROPE], (err, results) => {
//                     if (err) {
//                         console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
//                     } else {
//                         const count = results[0].count;
//                         if (count === 0) {
//                             // CHANGE_TIME chưa tồn tại, thêm dữ liệu mới vào bảng europe
//                             const insertQueryEurope = `
//                                 INSERT INTO europe (MATCH_ID, COMPANY_ID, INITIAL_HOME, INITIAL_DRAW, INITIAL_AWAY, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValuesEurope = [
//                                 europeData.MATCH_ID,
//                                 europeData.COMPANY_ID,
//                                 europeData.INITIAL_HOME,
//                                 europeData.INITIAL_DRAW,
//                                 europeData.INITIAL_AWAY,
//                                 europeData.INSTANT_HOME,
//                                 europeData.INSTANT_DRAW,
//                                 europeData.INSTANT_AWAY,
//                                 CHANGETIME_EUROPE,
//                                 europeData.ODDS_TYPE,
//                             ];

//                             connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
//                                 if (err) {
//                                     console.error('Lỗi thêm dữ liệu bảng europe:', err);
//                                 }
//                             });
//                         }
//                     }
//                 });
//             }

//             if (item?.$?.overUnder) {
//                 const overunderData = JSON.parse(item.$.overUnder);
//                 const CHANGETIME_OVERUNDER = overunderData.CHANGE_TIME;
//                 // Kiểm tra và thêm dữ liệu vào bảng europe
//                 const checkQueryOverUnder = `
//                     SELECT COUNT(*) as count
//                     FROM overunder
//                     WHERE CHANGE_TIME = ?;
//                 `;
//                 connection.query(checkQueryOverUnder, [CHANGETIME_OVERUNDER], (err, results) => {
//                     if (err) {
//                         console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
//                     } else {
//                         const count = results[0].count;
//                         if (count === 0) {
//                             // CHANGE_TIME chưa tồn tại, thêm dữ liệu mới vào bảng europe
//                             const insertQueryOverUnder = `
//                                 INSERT INTO overunder (MATCH_ID, COMPANY_ID, INITIAL_HANDICAP, INITIAL_OVER, INITIAL_UNDER, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValuesEurope = [
//                                 overunderData.MATCH_ID,
//                                 overunderData.COMPANY_ID,
//                                 overunderData.INITIAL_HANDICAP,
//                                 overunderData.INITIAL_OVER,
//                                 overunderData.INITIAL_UNDER,
//                                 overunderData.INSTANT_HANDICAP,
//                                 overunderData.INSTANT_OVER,
//                                 overunderData.INSTANT_UNDER,
//                                 CHANGETIME_OVERUNDER,
//                                 overunderData.ODDS_TYPE,
//                             ];

//                             connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
//                                 if (err) {
//                                     console.error('Lỗi thêm dữ liệu bảng europe:', err);
//                                 }
//                             });
//                         }
//                     }
//                 });
//             }

//         });

//         console.log("Hoàn thành cập nhật dữ liệu");
//     } catch (error) {
//         console.error("Error while fetching odds data: ", error);
//         return Promise.resolve([]);
//     }
// };


const getOdds = async () => {
    try {
        const data = await crawlOddsChangeAllApi();
        const oddsItem = Array.isArray(data) ? data : [data];


        oddsItem.forEach(async (item) => {
            if (item?.handicap) {
                const handicapData = JSON.parse(item.handicap);
                const CHANGETIME_HANDICAP = handicapData.CHANGE_TIME;
                // Kiểm tra và thêm dữ liệu vào bảng handicap
                const checkQueryHandicap = `
                    SELECT COUNT(*) as count
                    FROM handicap
                    WHERE CHANGE_TIME = ?;
                `;

                connection.query(checkQueryHandicap, [CHANGETIME_HANDICAP], (err, results) => {
                    if (err) {
                        console.error('Lỗi kiểm tra CHANGE_TIME:', err);
                    } else {
                        const count = results[0].count;
                        if (count === 0) {
                            // MATCH_ID chưa tồn tại, thêm dữ liệu mới
                            const insertQuery = `
                                INSERT INTO handicap (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                            `;

                            const insertValues = [
                                handicapData.MATCH_ID,
                                handicapData.COMPANY_ID,
                                handicapData.INSTANT_HANDICAP,
                                handicapData.INSTANT_HOME,
                                handicapData.INSTANT_AWAY,
                                handicapData.IN_PLAY,
                                CHANGETIME_HANDICAP,
                                handicapData.ODDS_TYPE,
                            ];

                            connection.query(insertQuery, insertValues, (err, insertResults) => {
                                if (err) {
                                    console.error('Lỗi thêm dữ liệu:', err);
                                }

                            });
                        }

                    }
                });
            }

            if (item?.europe) {
                const europeData = JSON.parse(item.europe);
                const CHANGETIME_EUROPE = europeData.CHANGE_TIME;
                // Kiểm tra và thêm dữ liệu vào bảng europe
                const checkQueryEurope = `
                    SELECT COUNT(*) as count
                    FROM europe
                    WHERE CHANGE_TIME = ?;
                `;
                connection.query(checkQueryEurope, [CHANGETIME_EUROPE], (err, results) => {
                    if (err) {
                        console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
                    } else {
                        const count = results[0].count;
                        if (count === 0) {
                            // CHANGE_TIME chưa tồn tại, thêm dữ liệu mới vào bảng europe
                            const insertQueryEurope = `
                                INSERT INTO europe (MATCH_ID, COMPANY_ID, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
                                VALUES (?, ?, ?, ?, ?, ?, ?);
                            `;

                            const insertValuesEurope = [
                                europeData.MATCH_ID,
                                europeData.COMPANY_ID,
                                europeData.INSTANT_HOME,
                                europeData.INSTANT_DRAW,
                                europeData.INSTANT_AWAY,
                                CHANGETIME_EUROPE,
                                europeData.ODDS_TYPE,
                            ];

                            connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
                                if (err) {
                                    console.error('Lỗi thêm dữ liệu bảng europe:', err);
                                }
                            });
                        }
                    }
                });
            }

            if (item?.overUnder) {
                const overunderData = JSON.parse(item.overUnder);
                const CHANGETIME_OVERUNDER = overunderData.CHANGE_TIME;
                // Kiểm tra và thêm dữ liệu vào bảng europe
                const checkQueryOverUnder = `
                    SELECT COUNT(*) as count
                    FROM overunder
                    WHERE CHANGE_TIME = ?;
                `;
                connection.query(checkQueryOverUnder, [CHANGETIME_OVERUNDER], (err, results) => {
                    if (err) {
                        console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
                    } else {
                        const count = results[0].count;
                        if (count === 0) {
                            // CHANGE_TIME chưa tồn tại, thêm dữ liệu mới vào bảng europe
                            const insertQueryOverUnder = `
                                INSERT INTO overunder (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
                                VALUES (?, ?, ?, ?, ?, ?, ?);
                            `;

                            const insertValuesEurope = [
                                overunderData.MATCH_ID,
                                overunderData.COMPANY_ID,
                                overunderData.INSTANT_HANDICAP,
                                overunderData.INSTANT_OVER,
                                overunderData.INSTANT_UNDER,
                                CHANGETIME_OVERUNDER,
                                overunderData.ODDS_TYPE,
                            ];

                            connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
                                if (err) {
                                    console.error('Lỗi thêm dữ liệu bảng europe:', err);
                                }
                            });
                        }
                    }
                });
            }

        });

        console.log("Hoàn thành cập nhật dữ liệu Odd change All");
    } catch (error) {
        console.error("Error while fetching odds data: ", error);
        return Promise.resolve([]);
    }
};

const deleteOdds = async () => {
    try {
        const filePath = "./data_xml/schedule_yesterday_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleItem = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

        // Lặp qua scheduleItem để lấy MATCH_ID
        for (const item of scheduleItem) {
            if (item?.$?.MATCH_ID) {
                const matchId = item.$.MATCH_ID;

                // Kiểm tra xem MATCH_ID đã tồn tại trong cơ sở dữ liệu hay chưa
                const checkQuery = `
                    SELECT COUNT(*) as count
                    FROM handicap
                    WHERE MATCH_ID = ?;
                `;
                const results = await queryDatabase(checkQuery, [matchId]);
                const count = results[0].count;

                if (count > 0) {
                    // Nếu MATCH_ID đã tồn tại, thực hiện xóa dữ liệu từng bảng riêng lẻ
                    await queryDatabase("DELETE FROM handicap WHERE MATCH_ID = ?", [matchId]);
                    await queryDatabase("DELETE FROM europe WHERE MATCH_ID = ?", [matchId]);
                    await queryDatabase("DELETE FROM overunder WHERE MATCH_ID = ?", [matchId]);
                }
            }
        }

        console.log("Hoàn thành cập nhật dữ liệu");
    } catch (error) {
        console.error("Error while fetching odds data: ", error);
        return Promise.resolve([]);
    }
}

// Hàm để thực hiện truy vấn cơ sở dữ liệu
async function queryDatabase(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}




export { getOdds, deleteOdds };
