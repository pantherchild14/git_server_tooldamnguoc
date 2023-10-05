// import cron from "node-cron";
import schedule from 'node-schedule';
import { xml_detail_match, xml_odds, xml_odds_change, xml_odds_history, xml_schedule, xml_statistics_match } from '../middleware/xmlMiddleware.js';
import { deleteOdds, getOdds } from '../controllers/oddController.js';

export const scheduleCron = async () => {

    // schedule.scheduleJob("cron-xml_schedule-2-minutes", "*/1 * * * *", async () => {
    //     await xml_odds_change();
    //     console.log("Crawling schedule XML sau 2 phút ...");
    // });

    schedule.scheduleJob("cron-xml_schedule-1-minutes", "*/1 * * * *", async () => {
        await xml_schedule();
        console.log("Crawling schedule XML sau 1 phút ...");
    });

    schedule.scheduleJob("cron-getOdds-1-minute-30-seconds", "*/1 * * * *", async () => {
        await getOdds();
        console.log("Crawling getOdds DB sau 1 phút ...");
    });

    schedule.scheduleJob("cron-xml_odds_history-1-minute", "*/1 * * * *", async () => {
        await xml_odds_history();
        console.log("Crawling xml_odds_history DB sau 1 phút ...");
    });

    schedule.scheduleJob("cron-xml_detail_match-1-minute", "*/1 * * * *", async () => {
        await xml_detail_match();
        console.log("Crawling xml_detail_match  sau 1 phút ...");
    });

    schedule.scheduleJob("cron-xml_odds-2-minutes", "*/3 * * * *", async () => {
        await xml_odds();
        console.log("Crawling xml_odds XML sau 3 phút ...");
    });

    schedule.scheduleJob("cron-xml_statistics_match-4-minute", "*/5 * * * *", async () => {
        await xml_statistics_match();
        console.log("Crawling xml_statistics_match  sau 4 phút ...");
    });

    schedule.scheduleJob("cron-deleteOdds-2-minute", "0 0 * * *", async () => {
        await deleteOdds();
        console.log("Crawling deleteOdds DB sau 2 phút ...");
    });
}