// import { parseXmlToJs, readXmlFile } from "../middleware/changeXML.js";
// import connection from "../configs/mysqlDb.js";

// const getScheduleday1 = async () => {
//     try {
//         const filePath = "./data_xml/schedule_data.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);

//         const scheduleItem = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

//         for (const item of scheduleItem) {
//             const matchID = item.$.MATCH_ID;

//             // Kiểm tra xem MATCH_ID đã tồn tại trong bảng schedule hay chưa
//             const checkQuery = `
//                 SELECT MATCH_ID
//                 FROM schedule
//                 WHERE MATCH_ID = ?;
//             `;

//             connection.query(checkQuery, [matchID], (err, results) => {
//                 if (err) {
//                     console.error('Lỗi kiểm tra MATCH_ID:', err);
//                 } else {
//                     if (results.length > 0) {
//                         // MATCH_ID đã tồn tại, thực hiện câu lệnh UPDATE
//                         const updateQuery = `
//                             UPDATE schedule
//                             SET
//                                 LEAGUE_NAME = ?,
//                                 LEAGUE_SHORT_NAME = ?,
//                                 MATCH_TIME = ?,
//                                 HALF_START_TIME = ?,
//                                 STATUS = ?,
//                                 HOME_NAME = ?,
//                                 AWAY_NAME = ?,
//                                 HOME_SCORE = ?,
//                                 AWAY_SCORE = ?,
//                                 HOME_RED = ?,
//                                 AWAY_RED = ?,
//                                 HOME_YELLOW = ?,
//                                 AWAY_YELLOW = ?,
//                                 HOME_RANK = ?,
//                                 AWAY_RANK = ?,
//                                 HOME_CORRNER = ?,
//                                 AWAY_CORRNER = ?,
//                                 WEATHER = ?
//                             WHERE MATCH_ID = ?;
//                         `;

//                         const updateValues = [
//                             item.$.LEAGUE_NAME,
//                             item.$.LEAGUE_SHORT_NAME,
//                             item.$.MATCH_TIME,
//                             item.$.HALF_START_TIME,
//                             item.$.STATUS,
//                             item.$.HOME_NAME,
//                             item.$.AWAY_NAME,
//                             item.$.HOME_SCORE,
//                             item.$.AWAY_SCORE,
//                             item.$.HOME_RED,
//                             item.$.AWAY_RED,
//                             item.$.HOME_YELLOW,
//                             item.$.AWAY_YELLOW,
//                             item.$.HOME_RANK,
//                             item.$.AWAY_RANK,
//                             item.$.HOME_CORRNER,
//                             item.$.AWAY_CORRNER,
//                             item.$.WEATHER,
//                             matchID
//                         ];

//                         connection.query(updateQuery, updateValues, (err, updateResults) => {
//                             if (err) {
//                                 console.error('Lỗi cập nhật dữ liệu:', err);
//                             }
//                         });
//                     } else {
//                         // MATCH_ID chưa tồn tại, thực hiện câu lệnh INSERT
//                         const insertQuery = `
//                             INSERT INTO schedule (MATCH_ID, LEAGUE_NAME, LEAGUE_SHORT_NAME, MATCH_TIME, HALF_START_TIME, STATUS, HOME_NAME, AWAY_NAME, HOME_SCORE, AWAY_SCORE, HOME_RED, AWAY_RED, HOME_YELLOW, AWAY_YELLOW, HOME_RANK, AWAY_RANK, HOME_CORRNER, AWAY_CORRNER, WEATHER)
//                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//                         `;

//                         const insertValues = [
//                             matchID,
//                             item.$.LEAGUE_NAME,
//                             item.$.LEAGUE_SHORT_NAME,
//                             item.$.MATCH_TIME,
//                             item.$.HALF_START_TIME,
//                             item.$.STATUS,
//                             item.$.HOME_NAME,
//                             item.$.AWAY_NAME,
//                             item.$.HOME_SCORE,
//                             item.$.AWAY_SCORE,
//                             item.$.HOME_RED,
//                             item.$.AWAY_RED,
//                             item.$.HOME_YELLOW,
//                             item.$.AWAY_YELLOW,
//                             item.$.HOME_RANK,
//                             item.$.AWAY_RANK,
//                             item.$.HOME_CORRNER,
//                             item.$.AWAY_CORRNER,
//                             item.$.WEATHER,
//                         ];

//                         connection.query(insertQuery, insertValues, (err, insertResults) => {
//                             if (err) {
//                                 console.error('Lỗi thêm dữ liệu:', err);
//                             }
//                         });
//                     }
//                 }
//             });
//         }

//         console.log("Hoàn thành cập nhật dữ liệu");
//     } catch (error) {
//         console.error("Error while fetching odds data: ", error);
//         return Promise.resolve([]);
//     }
// };



// const getScheduleday2 = async () => {
//     try {
//         const filePath = "./data_xml/schedule_2_day.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);

//         const scheduleItem = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

//         scheduleItem.forEach(async (item) => {
//             const matchID = item.$.MATCH_ID;
//             // Kiểm tra và thêm dữ liệu vào bảng schedule
//             const checkQuery = `
//                 SELECT COUNT(*) as count
//                 FROM schedule
//                 WHERE MATCH_ID = ?;
//             `;

//             connection.query(checkQuery, [matchID], (err, results) => {
//                 if (err) {
//                     console.error('Lỗi kiểm tra CHANGE_TIME:', err);
//                 } else {
//                     const count = results[0].count;
//                     if (count === 0) {
//                         // MATCH_ID chưa tồn tại, thêm dữ liệu mới
//                         const insertQuery = `
//                             INSERT INTO schedule (MATCH_ID, LEAGUE_NAME, LEAGUE_SHORT_NAME, MATCH_TIME, HALF_START_TIME, STATUS, HOME_NAME, AWAY_NAME, HOME_SCORE, AWAY_SCORE, HOME_RED, AWAY_RED, HOME_YELLOW, AWAY_YELLOW, HOME_RANK, AWAY_RANK, HOME_CORRNER, AWAY_CORRNER, WEATHER)
//                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//                         `;

//                         const insertValues = [
//                             matchID,
//                             item.$.LEAGUE_NAME,
//                             item.$.LEAGUE_SHORT_NAME,
//                             item.$.MATCH_TIME,
//                             item.$.HALF_START_TIME,
//                             item.$.STATUS,
//                             item.$.HOME_NAME,
//                             item.$.AWAY_NAME,
//                             item.$.HOME_SCORE,
//                             item.$.AWAY_SCORE,
//                             item.$.HOME_RED,
//                             item.$.AWAY_RED,
//                             item.$.HOME_YELLOW,
//                             item.$.AWAY_YELLOW,
//                             item.$.HOME_RANK,
//                             item.$.AWAY_RANK,
//                             item.$.HOME_CORRNER,
//                             item.$.AWAY_CORRNER,
//                             item.$.WEATHER,
//                         ];

//                         connection.query(insertQuery, insertValues, (err, insertResults) => {
//                             if (err) {
//                                 console.error('Lỗi thêm dữ liệu:', err);
//                             }

//                         });
//                     }

//                 }
//             });
//         });

//         console.log("Hoàn thành cập nhật dữ liệu");
//     } catch (error) {
//         console.error("Error while fetching odds data: ", error);
//         return Promise.resolve([]);
//     }
// };

// const getScheduleday3 = async () => {
//     try {
//         const filePath = "./data_xml/schedule_3_day.xml";
//         const xmlData = await readXmlFile(filePath);
//         const jsData = await parseXmlToJs(xmlData);

//         const scheduleItem = jsData.SCHEDULE_DATA.SCHEDULE_ITEM;

//         scheduleItem.forEach(async (item) => {
//             const matchID = item.$.MATCH_ID;
//             // Kiểm tra và thêm dữ liệu vào bảng schedule
//             const checkQuery = `
//                 SELECT COUNT(*) as count
//                 FROM schedule
//                 WHERE MATCH_ID = ?;
//             `;

//             connection.query(checkQuery, [matchID], (err, results) => {
//                 if (err) {
//                     console.error('Lỗi kiểm tra CHANGE_TIME:', err);
//                 } else {
//                     const count = results[0].count;
//                     if (count === 0) {
//                         // MATCH_ID chưa tồn tại, thêm dữ liệu mới
//                         const insertQuery = `
//                             INSERT INTO schedule (MATCH_ID, LEAGUE_NAME, LEAGUE_SHORT_NAME, MATCH_TIME, HALF_START_TIME, STATUS, HOME_NAME, AWAY_NAME, HOME_SCORE, AWAY_SCORE, HOME_RED, AWAY_RED, HOME_YELLOW, AWAY_YELLOW, HOME_RANK, AWAY_RANK, HOME_CORRNER, AWAY_CORRNER, WEATHER)
//                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
//                         `;

//                         const insertValues = [
//                             matchID,
//                             item.$.LEAGUE_NAME,
//                             item.$.LEAGUE_SHORT_NAME,
//                             item.$.MATCH_TIME,
//                             item.$.HALF_START_TIME,
//                             item.$.STATUS,
//                             item.$.HOME_NAME,
//                             item.$.AWAY_NAME,
//                             item.$.HOME_SCORE,
//                             item.$.AWAY_SCORE,
//                             item.$.HOME_RED,
//                             item.$.AWAY_RED,
//                             item.$.HOME_YELLOW,
//                             item.$.AWAY_YELLOW,
//                             item.$.HOME_RANK,
//                             item.$.AWAY_RANK,
//                             item.$.HOME_CORRNER,
//                             item.$.AWAY_CORRNER,
//                             item.$.WEATHER,
//                         ];

//                         connection.query(insertQuery, insertValues, (err, insertResults) => {
//                             if (err) {
//                                 console.error('Lỗi thêm dữ liệu:', err);
//                             }

//                         });
//                     }

//                 }
//             });
//         });

//         console.log("Hoàn thành cập nhật dữ liệu");
//     } catch (error) {
//         console.error("Error while fetching odds data: ", error);
//         return Promise.resolve([]);
//     }
// };


// export { getScheduleday1, getScheduleday2, getScheduleday3 }