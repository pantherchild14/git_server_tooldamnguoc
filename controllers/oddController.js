import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
import connection from "../configs/mysqlDb.js";
import { getOddsChangeXML } from "./xmlController.js";


// const getOddsRun = async () => {
//     try {
//         const filePath = "./data_xml/odds_change_data.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);

//         const oddsItem = jsData.ODDS_DATA.ODDS_ITEM;

//         oddsItem.forEach(async (item) => {
//             if (item?.$?.handicap) {
//                 const handicapData = JSON.parse(item.$.handicap);

//                 const checkMatchQuery = `
//                     SELECT *
//                     FROM handicap
//                     WHERE MATCH_ID = ? 
//                         AND CHANGE_TIME = ?
//                 `;

//                 connection.query(checkMatchQuery, [
//                     handicapData.MATCH_ID,
//                     handicapData.CHANGE_TIME
//                 ], (err, matchResults) => {
//                     if (err) {
//                         console.error('Lỗi kiểm tra MATCH_ID:', err);
//                     } else {
//                         if (matchResults.length === 0) {
//                             const insertQuery = `
//                                 INSERT INTO handicap (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValues = [
//                                 handicapData.MATCH_ID,
//                                 handicapData.COMPANY_ID,
//                                 handicapData.INSTANT_HANDICAP,
//                                 handicapData.INSTANT_HOME,
//                                 handicapData.INSTANT_AWAY,
//                                 handicapData.IN_PLAY,
//                                 handicapData.CHANGE_TIME,
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

//                 const checkQueryEurope = `
//                     SELECT *
//                     FROM europe
//                     WHERE MATCH_ID = ? 
//                         AND CHANGE_TIME = ?
//                 `;

//                 connection.query(checkQueryEurope, [
//                     europeData.MATCH_ID,
//                     europeData.CHANGE_TIME], (err, results) => {
//                         if (err) {
//                             console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
//                         } else {
//                             if (results.length === 0) {
//                                 const insertQueryEurope = `
//                                 INSERT INTO europe (MATCH_ID, COMPANY_ID, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?);
//                             `;

//                                 const insertValuesEurope = [
//                                     europeData.MATCH_ID,
//                                     europeData.COMPANY_ID,
//                                     europeData.INSTANT_HOME,
//                                     europeData.INSTANT_DRAW,
//                                     europeData.INSTANT_AWAY,
//                                     europeData.CHANGE_TIME,
//                                     europeData.ODDS_TYPE,
//                                 ];

//                                 connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
//                                     if (err) {
//                                         console.error('Lỗi thêm dữ liệu:', err);
//                                     }
//                                 });
//                             }

//                         }
//                     });
//             }

//             if (item?.$?.overUnder) {
//                 const overunderData = JSON.parse(item.$.overUnder);

//                 const checkQueryOverUnder = `
//                     SELECT *
//                     FROM overunder
//                     WHERE MATCH_ID = ? 
//                         AND CHANGE_TIME = ?
//                 `;

//                 connection.query(checkQueryOverUnder, [
//                     overunderData.MATCH_ID,
//                     overunderData.CHANGE_TIME
//                 ], (err, results) => {
//                     if (err) {
//                         console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
//                     } else {
//                         if (results.length === 0) {
//                             const insertQueryOverUnder = `
//                                 INSERT INTO overunder (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValuesEurope = [
//                                 overunderData.MATCH_ID,
//                                 overunderData.COMPANY_ID,
//                                 overunderData.INSTANT_HANDICAP,
//                                 overunderData.INSTANT_OVER,
//                                 overunderData.INSTANT_UNDER,
//                                 overunderData.CHANGE_TIME,
//                                 overunderData.ODDS_TYPE,
//                             ];

//                             connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
//                                 if (err) {
//                                     console.error('Lỗi thêm dữ liệu:', err);
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

const getOddsRun = async () => {
    try {
        const oddsItem = await getOddsChangeXML();

        oddsItem.forEach(async (item) => {
            if (item.handicap) {
                await processOddsHandicapItem(item, 'handicap');
            }
            if (item.overUnder) {
                await processOddsOverItem(item, 'overUnder');
            }
            if (item.europe) {
                await processOddsEuropeItem(item, 'europe');
            }
        });

        console.log("Hoàn thành cập nhật dữ liệu");
    } catch (error) {
        console.error("Error while fetching odds data: ", error);
        return Promise.resolve([]);
    }
};

const processOddsHandicapItem = async (item, tableName) => {
    if (!item || !item[tableName]) {
        return;
    }

    const data = JSON.parse(item[tableName]);
    const matchID = data.MATCH_ID;

    const checkMatchQuery = `
        SELECT *
        FROM handicap
        WHERE MATCH_ID = ? AND CHANGE_TIME = ?
        ORDER BY CHANGE_TIME DESC
        LIMIT 1
    `;

    connection.query(checkMatchQuery, [matchID, data.CHANGE_TIME], (err, matchResults) => {
        if (err) {
            console.error('Lỗi kiểm tra MATCH_ID:', err);
        } else {
            if (matchResults.length === 0) {
                const insertQuery = `
                    INSERT INTO handicap (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    INSTANT_HANDICAP = VALUES(INSTANT_HANDICAP),
                    INSTANT_HOME = VALUES(INSTANT_HOME),
                    INSTANT_AWAY = VALUES(INSTANT_AWAY),
                    IN_PLAY = VALUES(IN_PLAY),
                    CHANGE_TIME = VALUES(CHANGE_TIME),
                    ODDS_TYPE = VALUES(ODDS_TYPE);
                `;

                const insertValues = [
                    data.MATCH_ID,
                    data.COMPANY_ID,
                    data.INSTANT_HANDICAP,
                    data.INSTANT_HOME,
                    data.INSTANT_AWAY,
                    data.IN_PLAY,
                    data.CHANGE_TIME,
                    data.ODDS_TYPE,
                ];

                connection.query(insertQuery, insertValues, (err, insertResults) => {
                    if (err) {
                        console.error('Lỗi thêm dữ liệu:', err);
                    }
                });
            }
            // else {
            //     const existingRecord = matchResults[0];
            //     if (
            //         Number(existingRecord.INSTANT_HANDICAP) !== Number(data.INSTANT_HANDICAP) ||
            //         Number(existingRecord.INSTANT_HOME) !== Number(data.INSTANT_HOME) ||
            //         Number(existingRecord.INSTANT_AWAY) !== Number(data.INSTANT_AWAY)
            //     ) {
            //         const insertQuery = `
            //             INSERT INTO handicap (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
            //             VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            //         `;

            //         const insertValues = [
            //             data.MATCH_ID,
            //             data.COMPANY_ID,
            //             data.INSTANT_HANDICAP,
            //             data.INSTANT_HOME,
            //             data.INSTANT_AWAY,
            //             data.IN_PLAY,
            //             data.CHANGE_TIME,
            //             data.ODDS_TYPE,
            //         ];

            //         connection.query(insertQuery, insertValues, (err, insertResults) => {
            //             if (err) {
            //                 console.error('Lỗi thêm dữ liệu:', err);
            //             }
            //         });
            //     }
            // }
        }
    });
};

const processOddsEuropeItem = async (item, tableName) => {
    if (!item || !item[tableName]) {
        return;
    }

    const data = JSON.parse(item[tableName]);
    const matchID = data.MATCH_ID;

    const checkQueryEurope = `
        SELECT *
        FROM europe
        WHERE MATCH_ID = ? AND CHANGE_TIME = ?
        ORDER BY CHANGE_TIME DESC
        LIMIT 1
    `;

    connection.query(checkQueryEurope, [matchID, data.CHANGE_TIME], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
        } else {
            if (results.length === 0) {
                const insertQueryEurope = `
                    INSERT INTO europe (MATCH_ID, COMPANY_ID, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    INSTANT_HOME = VALUES(INSTANT_HOME),
                    INSTANT_DRAW = VALUES(INSTANT_DRAW),
                    INSTANT_AWAY = VALUES(INSTANT_AWAY),
                    CHANGE_TIME = VALUES(CHANGE_TIME),
                    ODDS_TYPE = VALUES(ODDS_TYPE);
                `;

                const insertValuesEurope = [
                    data.MATCH_ID,
                    data.COMPANY_ID,
                    data.INSTANT_HOME,
                    data.INSTANT_DRAW,
                    data.INSTANT_AWAY,
                    data.CHANGE_TIME,
                    data.ODDS_TYPE,
                ];

                connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
                    if (err) {
                        console.error('Lỗi thêm dữ liệu:', err);
                    }
                });
            }
            // else {
            //     const existingRecord = results[0];
            //     if (
            //         Number(existingRecord.INSTANT_HOME) !== Number(data.INSTANT_HOME) ||
            //         Number(existingRecord.INSTANT_DRAW) !== Number(data.INSTANT_DRAW) ||
            //         Number(existingRecord.INSTANT_AWAY) !== Number(data.INSTANT_AWAY)
            //     ) {
            //         const insertQueryEurope = `
            //             INSERT INTO europe (MATCH_ID, COMPANY_ID, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
            //             VALUES (?, ?, ?, ?, ?, ?, ?);
            //         `;

            //         const insertValuesEurope = [
            //             data.MATCH_ID,
            //             data.COMPANY_ID,
            //             data.INSTANT_HOME,
            //             data.INSTANT_DRAW,
            //             data.INSTANT_AWAY,
            //             data.CHANGE_TIME,
            //             data.ODDS_TYPE,
            //         ];

            //         connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
            //             if (err) {
            //                 console.error('Lỗi thêm dữ liệu:', err);
            //             }
            //         });
            //     }
            // }
        }
    });
};

const processOddsOverItem = async (item, tableName) => {
    if (!item || !item[tableName]) {
        return;
    }

    const data = JSON.parse(item[tableName]);
    const matchID = data.MATCH_ID;

    const checkQueryOverUnder = `
        SELECT *
        FROM overunder
        WHERE MATCH_ID = ? AND CHANGE_TIME = ?
        ORDER BY CHANGE_TIME DESC
        LIMIT 1
    `;


    connection.query(checkQueryOverUnder, [matchID, data.CHANGE_TIME], (err, results) => {
        if (err) {
            console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
        } else {
            if (results.length === 0) {
                const insertQueryOverUnder = `
                    INSERT INTO overunder (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    INSTANT_HANDICAP = VALUES(INSTANT_HANDICAP),
                    INSTANT_OVER = VALUES(INSTANT_OVER),
                    INSTANT_UNDER = VALUES(INSTANT_UNDER),
                    CHANGE_TIME = VALUES(CHANGE_TIME),
                    ODDS_TYPE = VALUES(ODDS_TYPE);
                `;

                const insertValuesEurope = [
                    data.MATCH_ID,
                    data.COMPANY_ID,
                    data.INSTANT_HANDICAP,
                    data.INSTANT_OVER,
                    data.INSTANT_UNDER,
                    data.CHANGE_TIME,
                    data.ODDS_TYPE,
                ];

                connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
                    if (err) {
                        console.error('Lỗi thêm dữ liệu:', err);
                    }
                });
            }
            // else {
            //     const existingRecord = results[0];
            //     if (
            //         Number(existingRecord.INSTANT_HANDICAP) !== Number(data.INSTANT_HANDICAP) ||
            //         Number(existingRecord.INSTANT_OVER) !== Number(data.INSTANT_OVER) ||
            //         Number(existingRecord.INSTANT_UNDER) !== Number(data.INSTANT_UNDER)
            //     ) {
            //         const insertQueryOverUnder = `
            //             INSERT INTO overunder (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
            //             VALUES (?, ?, ?, ?, ?, ?, ?);
            //         `;

            //         const insertValuesEurope = [
            //             data.MATCH_ID,
            //             data.COMPANY_ID,
            //             data.INSTANT_HANDICAP,
            //             data.INSTANT_OVER,
            //             data.INSTANT_UNDER,
            //             data.CHANGE_TIME,
            //             data.ODDS_TYPE,
            //         ];

            //         connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
            //             if (err) {
            //                 console.error('Lỗi thêm dữ liệu:', err);
            //             }
            //         });
            //     }
            // }
        }
    });
};

const getOdds = async () => {
    try {
        const filePath = "./data_xml/odds_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const oddsItem = jsData.ODDS_DATA.ODDS_ITEM;

        oddsItem.forEach(async (item) => {
            if (item?.$?.handicap) {
                const handicapData = JSON.parse(item.$.handicap);

                const checkMatchQuery = `
                    SELECT *
                    FROM handicap
                    WHERE MATCH_ID = ? AND CHANGE_TIME = ?
                `;

                connection.query(checkMatchQuery, [handicapData.MATCH_ID, handicapData.CHANGE_TIME], (err, matchResults) => {
                    if (err) {
                        console.error('Lỗi kiểm tra MATCH_ID:', err);
                    } else {
                        if (matchResults.length === 0) {
                            const insertQuery = `
                                INSERT INTO handicap (MATCH_ID, COMPANY_ID, INITIAL_HANDICAP, INITIAL_HOME, INITIAL_AWAY, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                            `;

                            const insertValues = [
                                handicapData.MATCH_ID,
                                handicapData.COMPANY_ID,
                                handicapData.INITIAL_HANDICAP,
                                handicapData.INITIAL_HOME,
                                handicapData.INITIAL_AWAY,
                                handicapData.INSTANT_HANDICAP,
                                handicapData.INSTANT_HOME,
                                handicapData.INSTANT_AWAY,
                                handicapData.IN_PLAY,
                                handicapData.CHANGE_TIME,
                                handicapData.ODDS_TYPE,
                            ];

                            connection.query(insertQuery, insertValues, (err, insertResults) => {
                                if (err) {
                                    console.error('Lỗi thêm dữ liệu:', err);
                                }
                            });
                        }
                        // else {
                        //     const existingRecord = matchResults[0];
                        //     if (
                        //         Number(existingRecord.INSTANT_HANDICAP) !== Number(handicapData.INSTANT_HANDICAP) ||
                        //         Number(existingRecord.INSTANT_HOME) !== Number(handicapData.INSTANT_HOME) ||
                        //         Number(existingRecord.INSTANT_AWAY) !== Number(handicapData.INSTANT_AWAY)
                        //     ) {
                        //         const insertQuery = `
                        //             INSERT INTO handicap (MATCH_ID, COMPANY_ID, INITIAL_HANDICAP, INITIAL_HOME, INITIAL_AWAY, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
                        //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        //         `;

                        //         const insertValues = [
                        //             handicapData.MATCH_ID,
                        //             handicapData.COMPANY_ID,
                        //             handicapData.INITIAL_HANDICAP,
                        //             handicapData.INITIAL_HOME,
                        //             handicapData.INITIAL_AWAY,
                        //             handicapData.INSTANT_HANDICAP,
                        //             handicapData.INSTANT_HOME,
                        //             handicapData.INSTANT_AWAY,
                        //             handicapData.IN_PLAY,
                        //             handicapData.CHANGE_TIME,
                        //             handicapData.ODDS_TYPE,
                        //         ];

                        //         connection.query(insertQuery, insertValues, (err, insertResults) => {
                        //             if (err) {
                        //                 console.error('Lỗi thêm dữ liệu:', err);
                        //             }
                        //         });
                        //     }
                        // }
                    }
                });
            }

            if (item?.$?.europe) {
                const europeData = JSON.parse(item.$.europe);
                const checkQueryEurope = `
                    SELECT *
                        FROM europe
                        WHERE MATCH_ID = ? AND CHANGE_TIME = ?
                `;

                connection.query(checkQueryEurope, [europeData.MATCH_ID, europeData.CHANGE_TIME], (err, results) => {
                    if (err) {
                        console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
                    } else {
                        if (results.length === 0) {
                            const insertQueryEurope = `
                                INSERT INTO europe (MATCH_ID, COMPANY_ID, INITIAL_HOME, INITIAL_DRAW, INITIAL_AWAY, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                            `;

                            const insertValuesEurope = [
                                europeData.MATCH_ID,
                                europeData.COMPANY_ID,
                                europeData.INITIAL_HOME,
                                europeData.INITIAL_DRAW,
                                europeData.INITIAL_AWAY,
                                europeData.INSTANT_HOME,
                                europeData.INSTANT_DRAW,
                                europeData.INSTANT_AWAY,
                                europeData.CHANGE_TIME,
                                europeData.ODDS_TYPE,
                            ];

                            connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
                                if (err) {
                                    console.error('Lỗi thêm dữ liệu bảng europe:', err);
                                }
                            });
                        }
                        // else {
                        //     const existingRecord = results[0];
                        //     if (
                        //         Number(existingRecord.INSTANT_HOME) !== Number(europeData.INSTANT_HOME) ||
                        //         Number(existingRecord.INSTANT_DRAW) !== Number(europeData.INSTANT_DRAW) ||
                        //         Number(existingRecord.INSTANT_AWAY) !== Number(europeData.INSTANT_AWAY)
                        //     ) {
                        //         const insertQueryEurope = `
                        //             INSERT INTO europe (MATCH_ID, COMPANY_ID, INITIAL_HOME, INITIAL_DRAW, INITIAL_AWAY, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
                        //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        //         `;

                        //         const insertValuesEurope = [
                        //             europeData.MATCH_ID,
                        //             europeData.COMPANY_ID,
                        //             europeData.INITIAL_HOME,
                        //             europeData.INITIAL_DRAW,
                        //             europeData.INITIAL_AWAY,
                        //             europeData.INSTANT_HOME,
                        //             europeData.INSTANT_DRAW,
                        //             europeData.INSTANT_AWAY,
                        //             europeData.CHANGE_TIME,
                        //             europeData.ODDS_TYPE,
                        //         ];

                        //         connection.query(insertQueryEurope, insertValuesEurope, (err, insertResults) => {
                        //             if (err) {
                        //                 console.error('Lỗi thêm dữ liệu:', err);
                        //             }
                        //         });
                        //     }
                        // }
                    }
                });
            }

            if (item?.$?.overUnder) {
                const overunderData = JSON.parse(item.$.overUnder);

                const checkQueryOverUnder = `
                    SELECT *
                        FROM overunder
                        WHERE MATCH_ID = ? AND CHANGE_TIME = ?
                `;

                connection.query(checkQueryOverUnder, [overunderData.MATCH_ID, overunderData.CHANGE_TIME], (err, results) => {
                    if (err) {
                        console.error('Lỗi kiểm tra CHANGE_TIME bảng europe:', err);
                    } else {
                        if (results.length === 0) {
                            const insertQueryOverUnder = `
                                INSERT INTO overunder (MATCH_ID, COMPANY_ID, INITIAL_HANDICAP, INITIAL_OVER, INITIAL_UNDER, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                            `;

                            const insertValuesEurope = [
                                overunderData.MATCH_ID,
                                overunderData.COMPANY_ID,
                                overunderData.INITIAL_HANDICAP,
                                overunderData.INITIAL_OVER,
                                overunderData.INITIAL_UNDER,
                                overunderData.INSTANT_HANDICAP,
                                overunderData.INSTANT_OVER,
                                overunderData.INSTANT_UNDER,
                                overunderData.CHANGE_TIME,
                                overunderData.ODDS_TYPE,
                            ];

                            connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
                                if (err) {
                                    console.error('Lỗi thêm dữ liệu bảng europe:', err);
                                }
                            });
                        }
                        // else {
                        //     const existingRecord = results[0];
                        //     if (
                        //         Number(existingRecord.INSTANT_HANDICAP) !== Number(overunderData.INSTANT_HANDICAP) ||
                        //         Number(existingRecord.INSTANT_OVER) !== Number(overunderData.INSTANT_OVER) ||
                        //         Number(existingRecord.INSTANT_UNDER) !== Number(overunderData.INSTANT_UNDER)
                        //     ) {
                        //         const insertQueryOverUnder = `
                        //             INSERT INTO overunder (MATCH_ID, COMPANY_ID, INITIAL_HANDICAP, INITIAL_OVER, INITIAL_UNDER, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
                        //             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                        //         `;

                        //         const insertValuesEurope = [
                        //             overunderData.MATCH_ID,
                        //             overunderData.COMPANY_ID,
                        //             overunderData.INITIAL_HANDICAP,
                        //             overunderData.INITIAL_OVER,
                        //             overunderData.INITIAL_UNDER,
                        //             overunderData.INSTANT_HANDICAP,
                        //             overunderData.INSTANT_OVER,
                        //             overunderData.INSTANT_UNDER,
                        //             overunderData.CHANGE_TIME,
                        //             overunderData.ODDS_TYPE,
                        //         ];

                        //         connection.query(insertQueryOverUnder, insertValuesEurope, (err, insertResults) => {
                        //             if (err) {
                        //                 console.error('Lỗi thêm dữ liệu:', err);
                        //             }
                        //         });
                        //     }
                        // }
                    }
                });
            }

        });

        console.log("Hoàn thành cập nhật dữ liệu");
    } catch (error) {
        console.error("Error while fetching odds data: ", error);
        return Promise.resolve([]);
    }
};


// const getOdds = async () => {
//     try {
//         const data = await crawlOddsChangeAllApi();
//         const oddsItem = Array.isArray(data) ? data : [data];


//         oddsItem.forEach(async (item) => {
//             if (item?.handicap) {
//                 const handicapData = JSON.parse(item.handicap);
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
//                                 INSERT INTO handicap (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY, IN_PLAY, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValues = [
//                                 handicapData.MATCH_ID,
//                                 handicapData.COMPANY_ID,
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

//             if (item?.europe) {
//                 const europeData = JSON.parse(item.europe);
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
//                                 INSERT INTO europe (MATCH_ID, COMPANY_ID, INSTANT_HOME, INSTANT_DRAW, INSTANT_AWAY, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValuesEurope = [
//                                 europeData.MATCH_ID,
//                                 europeData.COMPANY_ID,
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

//             if (item?.overUnder) {
//                 const overunderData = JSON.parse(item.overUnder);
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
//                                 INSERT INTO overunder (MATCH_ID, COMPANY_ID, INSTANT_HANDICAP, INSTANT_OVER, INSTANT_UNDER, CHANGE_TIME, ODDS_TYPE)
//                                 VALUES (?, ?, ?, ?, ?, ?, ?);
//                             `;

//                             const insertValuesEurope = [
//                                 overunderData.MATCH_ID,
//                                 overunderData.COMPANY_ID,
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

//         console.log("Hoàn thành cập nhật dữ liệu Odd change All");
//     } catch (error) {
//         console.error("Error while fetching odds data: ", error);
//         return Promise.resolve([]);
//     }
// };

const deleteOdds = async () => {
    try {
        const filePath = "./data_xml/schedule_data.xml";
        const xmlData = await readXmlFile(filePath);
        const jsData = await parseXmlToJs(xmlData);

        const scheduleItem = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

        const validStatusValues = [-1, -10, -11, -12, -13, -14];

        for (const item of scheduleItem) {
            if (item?.$?.MATCH_ID) {
                const matchId = item.$.MATCH_ID;
                const status = item.$.STATUS;

                if (validStatusValues.includes(parseInt(status, 10))) {
                    const checkHandicapQuery = `
                        SELECT COUNT(*) as count
                        FROM handicap
                        WHERE MATCH_ID = ?;
                    `;
                    const handicapResults = await queryDatabase(checkHandicapQuery, [matchId]);
                    const handicapCount = handicapResults[0].count;

                    const checkEuropeQuery = `
                        SELECT COUNT(*) as count
                        FROM europe
                        WHERE MATCH_ID = ?;
                    `;
                    const europeResults = await queryDatabase(checkEuropeQuery, [matchId]);
                    const europeCount = europeResults[0].count;

                    const checkOverunderQuery = `
                        SELECT COUNT(*) as count
                        FROM overunder
                        WHERE MATCH_ID = ?;
                    `;
                    const overunderResults = await queryDatabase(checkOverunderQuery, [matchId]);
                    const overunderCount = overunderResults[0].count;

                    if (handicapCount > 0) {
                        await queryDatabase("DELETE FROM handicap WHERE MATCH_ID = ?", [matchId]);
                    }
                    if (europeCount > 0) {
                        await queryDatabase("DELETE FROM europe WHERE MATCH_ID = ?", [matchId]);
                    }
                    if (overunderCount > 0) {
                        await queryDatabase("DELETE FROM overunder WHERE MATCH_ID = ?", [matchId]);
                    }
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




export { getOdds, deleteOdds, getOddsRun };
