import dotenv from 'dotenv';
import { curl } from './crawl.js';

dotenv.config();

// Hàm tạo URL thay thế
function generateUrl(domain, key) {
    const url = '__DOMAIN__/sport/football/livescores?api_key=__KEY_API__';

    const replacedUrl = url
        .replace('__DOMAIN__', domain)
        .replace('__KEY_API__', key);

    return replacedUrl;
}

// Hàm lấy lịch trình
const crawlScheduleChangeApi = async () => {
    const DOMAIN = process.env.DOMAIN_API;
    const KEY = process.env.KEY_API;
    const replacedUrl = generateUrl(DOMAIN, KEY);

    try {
        let data = await curl(replacedUrl);
        if (data["code"] !== 0 && data["message"] !== 'success') {
            return;
        }

        if (Array.isArray(data["data"])) {
            const arrData = data["data"].map(schedule);
            return arrData;
        } else {
            return 'Data is not an array';
        }
    } catch (error) {
        throw new Error('Internal server error');
    }
};


/*
 * Giá trị 1: matchId,
 * giá trị 2: leagueName
 * giá trị 3: leagueShortName
 * giá trị 4: matchTime
 * giá trị 5: status
 * giá trị 6: homeName
 * giá trị 7: awayName
 * giá trị 8: homeScore
 * giá trị 9: awayScore
 * giá trị 10: homeRed
 * giá trị 11: awayRed
 * giá trị 12: homeYellow
 * giá trị 13: awayYellow
 * giá trị 14: homeRank
 * giá trị 15: awayRank
 * giá trị 16: homeCorner
 * giá trị 17: awayCorner
 * giá trị 18: weather
*/

const schedule = (str) => {
    const data = {
        MATCH_ID: str["matchId"],
        LEAGUE_NAME: str["leagueName"],
        LEAGUE_SHORT_NAME: str["leagueShortName"],
        MATCH_TIME: str["matchTime"],
        HALF_START_TIME: str["halfStartTime"],
        STATUS: str["status"],
        HOME_NAME: str["homeName"],
        AWAY_NAME: str["awayName"],
        HOME_SCORE: str["homeScore"],
        AWAY_SCORE: str["awayScore"],
        HOME_RED: str["homeRed"],
        AWAY_RED: str["awayRed"],
        HOME_YELLOW: str["homeYellow"],
        AWAY_YELLOW: str["awayYellow"],
        HOME_RANK: str["homeRank"],
        AWAY_RANK: str["awayRank"],
        HOME_CORRNER: str["homeCorner"],
        AWAY_CORRNER: str["awayCorner"],
        WEATHER: str["weather"],
    }

    return data;
}

export { crawlScheduleChangeApi };
