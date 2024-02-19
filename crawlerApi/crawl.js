import request from "request";
import axios from "axios";
import zlib from 'zlib';
import * as fetch from "node-fetch";

export const curl = async (url) => {
    try {
        const options = {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.66 Safari/537.36'
            },
        };

        const response = await axios(url, options);
        return response.data;
    } catch (error) {
        throw new Error(error.message || 'Internal server error');
    }
};


export const crawlLink = (link) => {
    return new Promise((resolve, reject) => {
        request(link, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                reject(error || "Internal server error");
            }
        });
    });
};