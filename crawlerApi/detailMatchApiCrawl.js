import dotenv from 'dotenv';
import { curl } from './crawl.js';

dotenv.config();

// Hàm tạo URL thay thế
function generateUrl(domain, key) {
    const url = '__DOMAIN__/sport/football/events?api_key=__KEY_API__';

    const replacedUrl = url
        .replace('__DOMAIN__', domain)
        .replace('__KEY_API__', key);

    return replacedUrl;
}

// Hàm lấy lịch trình
const crawlDetailMatchApi = async () => {
    const DOMAIN = process.env.DOMAIN_API;
    const KEY = process.env.KEY_API;
    const replacedUrl = generateUrl(DOMAIN, KEY);

    try {
        let data = await curl(replacedUrl);
        if (data["code"] !== 0 && data["message"] !== 'success') {
            return;
        }

        if (Array.isArray(data["data"])) {
            const arrData = data["data"].map(detail);
            return arrData;
        } else {
            return 'Data is not an array';
        }
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Internal server error');
    }
};


const detail = (str) => {
    const data = {
        MATCH_ID: str["matchId"],
        EVENTS: JSON.stringify(str["events"]),
        PENALTY: JSON.stringify(str["penalty"]),
    }

    return data;
}

export { crawlDetailMatchApi };
