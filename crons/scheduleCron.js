// import cron from "node-cron";
import schedule from 'node-schedule';
import { xml_analysis, xml_detail_match, xml_odds, xml_odds_change, xml_odds_history, xml_schedule, xml_schedule3Day, xml_schedule_yesterday, xml_statistics_match } from '../middleware/xmlMiddleware.js';
import { deleteOdds, getOdds, getOddsRun } from '../controllers/oddController.js';

export const scheduleCron = async () => {
    // * * * * *
    // | | | | |
    // | | | | +---- Day of the week (0 - 6) (Sunday = 0)
    // | | | +------ Month (1 - 12)
    // | | +-------- Day of the month (1 - 31)
    // | +---------- Hour (0 - 23)
    // +------------ Minute (0 - 59)

    // socket 
    // schedule.scheduleJob("cron-xml_odds_change-10-Seconds", "*/2 * * * * *", async () => {
    //     await xml_odds_change();
    //     console.log("Crawling xml_odds_change XML 10 Seconds ...");
    // });

    schedule.scheduleJob("cron-xml_schedule-10-seconds", "*/10 * * * * *", async () => {
        await xml_schedule();
        console.log("Crawling schedule XML sau 10 seconds ...");
    });

    // xml 
    schedule.scheduleJob("cron-getOddsRun-10-Seconds", "*/40 * * * * *", async () => {
        await getOddsRun();
        console.log("Crawling getOddsRun DB sau 20 giây ...");
    });

    schedule.scheduleJob("cron-xml_odds-1-minutes", "*/30 * * * * *", async () => { //  */1 * * * *
        await xml_odds();
        console.log("Crawling xml_odds XML sau 3 phút ...");
    });

    schedule.scheduleJob("cron-getOdds-1-minute-30-seconds", "*/5 * * * *", async () => {
        await getOdds();
        console.log("Crawling getOdds DB sau 1 phút 10 giây ...");
    });

    schedule.scheduleJob("cron-xml_odds_history-1-minute", "*/1 * * * *", async () => {
        await xml_odds_history();
        console.log("Crawling xml_odds_history DB sau 1 phút ...");
    });

    schedule.scheduleJob("cron-xml_detail_match-1-minute", "*/15 * * * * *", async () => {
        await xml_detail_match();
        console.log("Crawling xml_detail_match  sau 10s ...");
    });

    schedule.scheduleJob("cron-xml_statistics_match-4-minute", "*/15 * * * * *", async () => {
        await xml_statistics_match();
        console.log("Crawling xml_statistics_match  sau 10s ...");
    });

    schedule.scheduleJob("cron-xml_schedule3Day-1-minutes", "*/10 * * * *", async () => {
        await xml_schedule3Day();
        console.log("Crawling xml_schedule3Day XML sau 10 phút ...");
    });

    schedule.scheduleJob("cron-deleteOdds-daily", "*/10 * * * *", async () => {
        await deleteOdds();
        console.log("Crawling deleteOdds sau cron daily...");
    });

    // schedule.scheduleJob("cron-xml_schedule_yesterday-daily", "0 12 * * *", async () => {
    //     await xml_schedule_yesterday();
    //     console.log("Crawling xml_schedule_yesterday sau cron daily...");
    // });

    schedule.scheduleJob("cron-xml_analysis-daily", "2 0 * * *", async () => {
        await xml_analysis();
        console.log("Crawling xml_analysis sau cron daily...");
    });

}