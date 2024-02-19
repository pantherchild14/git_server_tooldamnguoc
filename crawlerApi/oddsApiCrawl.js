import dotenv from 'dotenv';
import { curl } from './crawl.js';

dotenv.config();

// Hàm tạo URL thay thế
function generateUrl(domain, key, BET_ID) {
    const url = '__DOMAIN__/sport/football/odds/main?api_key=__KEY_API__&companyId=__BET_ID__';
    const replacedUrl = url
        .replace('__DOMAIN__', domain)
        .replace('__KEY_API__', key)
        .replace('__BET_ID__', BET_ID)

    return replacedUrl;
}

// Hàm lấy lịch trình
const crawlOddsApi = async () => {
    const DOMAIN = process.env.DOMAIN_API;
    const KEY = process.env.KEY_API;
    const BET_ID = process.env.BET_ID;
    const replacedUrl = generateUrl(DOMAIN, KEY, BET_ID);

    try {
        let data = await curl(replacedUrl);

        if (data && data["code"] !== 0 && data["message"] !== 'success') {
            return;
        }

        const combinedData = [];

        if (data["data"]) {
            const handicap = data["data"]['handicap'];
            const europeOdds = data["data"]['europeOdds'];
            const overUnder = data["data"]['overUnder'];

            const matchIdMap = {};

            // Process handicap data
            handicap.forEach((line) => {
                const values = line.split(',');
                const matchId = values[0];

                const parsedData = odds_handicap(values);
                if (parsedData) {
                    if (!matchIdMap[matchId]) {
                        matchIdMap[matchId] = {};
                    }

                    matchIdMap[matchId].handicap = JSON.stringify(parsedData);
                }
            });

            // Process europeOdds data
            europeOdds.forEach((line) => {
                const values = line.split(',');
                const matchId = values[0];

                const parsedData = odds_europe(values);
                if (parsedData) {
                    if (!matchIdMap[matchId]) {
                        matchIdMap[matchId] = {};
                    }

                    matchIdMap[matchId].europe = JSON.stringify(parsedData);
                }
            });

            // Process overUnder data
            overUnder.forEach((line) => {
                const values = line.split(',');
                const matchId = values[0];

                const parsedData = (odds_overUnder(values));
                if (parsedData) {
                    if (!matchIdMap[matchId]) {
                        matchIdMap[matchId] = {};
                    }

                    matchIdMap[matchId].overUnder = JSON.stringify(parsedData);
                }
            });

            for (const matchId in matchIdMap) {
                const combinedMatchData = {
                    MATCH_ID: matchId,
                    ...matchIdMap[matchId],
                };

                combinedData.push(combinedMatchData);
            }
        }

        // Print the combined data
        return (combinedData);
    } catch (error) {
        throw new Error('Internal server error');
    }
};

/**
 * 1: INITIAL_HANDICAP, INITIAL_HOME, INITIAL_AWAY : là kèo sớm
 * 2: INSTANT_HANDICAP, INSTANT_HOME, INSTANT_AWAY: 
 *  + kèo LIVE nếu: IN_PLAY FALSE 
 *  + kèo RUN NẾU IN_PLAY: TRUE
 * 3: STATUS KÈO 
 *  + 0: là không thể xác định
 *  + 1: kèo sớm 
 *  + 2: kèo mở
 *  + 3: kèo run
 */

const odds_handicap = (str) => {
    const data = {
        MATCH_ID: str[0],
        COMPANY_ID: str[1],
        INITIAL_HANDICAP: str[2],
        INITIAL_HOME: str[3],
        INITIAL_AWAY: str[4],
        INSTANT_HANDICAP: str[5],
        INSTANT_HOME: str[6],
        INSTANT_AWAY: str[7],
        IN_PLAY: str[9],
        CHANGE_TIME: str[10],
        ODDS_TYPE: str[12]
    }

    return data;
};

const odds_europe = (str) => {
    const data = {
        MATCH_ID: str[0],
        COMPANY_ID: str[1],
        INITIAL_HOME: str[2],
        INITIAL_DRAW: str[3],
        INITIAL_AWAY: str[4],
        INSTANT_HOME: str[5],
        INSTANT_DRAW: str[6],
        INSTANT_AWAY: str[7],
        CHANGE_TIME: str[8],
        ODDS_TYPE: str[10]
    }

    return data;
};

const odds_overUnder = (str) => {
    const data = {
        MATCH_ID: str[0],
        COMPANY_ID: str[1],
        INITIAL_HANDICAP: str[2],
        INITIAL_OVER: str[3],
        INITIAL_UNDER: str[4],
        INSTANT_HANDICAP: str[5],
        INSTANT_OVER: str[6],
        INSTANT_UNDER: str[7],
        CHANGE_TIME: str[8],
        ODDS_TYPE: str[10]
    }

    return data;
};

export { crawlOddsApi };
