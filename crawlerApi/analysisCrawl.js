import dotenv from 'dotenv';
import { curl } from './crawl.js';

dotenv.config();

// Hàm tạo URL thay thế
function generateUrl(domain, key, matchid) {
    const url = '__DOMAIN__/sport/football/analysis?api_key=__KEY_API__&matchId=__MATCH_ID__';

    const replacedUrl = url
        .replace('__DOMAIN__', domain)
        .replace('__KEY_API__', key)
        .replace('__MATCH_ID__', matchid);

    return replacedUrl;
}

// Hàm lấy lịch trình
const crawlAnalysisMatchApi = async (matchID) => {
    const DOMAIN = process.env.DOMAIN_API;
    const KEY = process.env.KEY_API;
    const replacedUrl = generateUrl(DOMAIN, KEY, matchID);

    try {
        let data = await curl(replacedUrl);
        if (data["code"] !== 0 && data["message"] !== 'success') {
            return;
        }

        const innerData = data["data"];

        if (typeof innerData === 'object' && innerData !== null) {
            const data = analysis(innerData, matchID);
            return data;
        } else {
            console.error('Data is not an object');
            return [];
        }

    } catch (error) {
        console.error('Error:', error);
        throw new Error('Internal server error');
    }
};


const analysis = (str, matchID) => {
    const data = {
        MATCH_ID: matchID,
        HEADTOHEAD: (str["headToHead"]),
        HOME_LAST_MATCH: (str["homeLastMatches"]),
        AWAY_LAST_MATCH: (str["awayLastMatches"]),
    }

    return data;
}


export { crawlAnalysisMatchApi };
