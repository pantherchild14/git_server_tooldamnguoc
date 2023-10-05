import xmlbuilder from "xmlbuilder";
import { promises as fs } from "fs";
import { Parser } from "xml2js";



const readXmlFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return data;
    } catch (err) {
        throw err;
    }
};

const parseXmlToJs = (xmlData) => {
    return new Promise((resolve, reject) => {
        const parser = new Parser();
        parser.parseString(xmlData, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

export {
    readXmlFile,
    parseXmlToJs,

    // xml_change_schedule_3day
};