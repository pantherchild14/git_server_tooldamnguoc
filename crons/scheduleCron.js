// import cron from "node-cron";
import schedule from 'node-schedule';
import { xml_detail_match, xml_odds, xml_odds_change, xml_odds_history, xml_schedule, xml_schedule_2_day, xml_schedule_3_day, xml_schedule_yesterday, xml_statistics_match } from '../middleware/xmlMiddleware.js';
import { deleteOdds, getOdds } from '../controllers/oddController.js';
import { getScheduleday1, getScheduleday2, getScheduleday3 } from '../controllers/scheduleController.js';

export const scheduleCron = async () => {

    // schedule.scheduleJob("cron-xml_schedule-2-minutes", "*/1 * * * *", async () => {
    //     await xml_odds_change();
    //     console.log("Crawling schedule XML sau 2 phút ...");
    // });

    // schedule.scheduleJob("cron-xml_schedule-1-minutes", "*/1 * * * *", async () => {
    //     await xml_schedule();
    //     console.log("Crawling schedule XML sau 1 phút ...");
    // });
    schedule.scheduleJob("cron-getScheduleday1-1-minute", "*/1 * * * *", async () => {
        await getScheduleday1();
        console.log("Crawling getScheduleday1 DB sau 1 minute ...");
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

    //1 ngày cron 1 lần 

    // schedule.scheduleJob("cron-xml_schedule-12hPM", "0 12 * * *", async () => {
    //     await xml_schedule();
    //     console.log("Crawling xml_schedule DB sau 12hPM ...");
    // });

    schedule.scheduleJob("cron-xml_schedule_2_day-12h4PM", "2 12 * * *", async () => {
        await xml_schedule_2_day();
        console.log("Crawling xml_schedule_2_day DB sau 12h2PM ...");
    });

    schedule.scheduleJob("cron-xml_schedule_3_day-12h4PM", "4 12 * * *", async () => {
        await xml_schedule_3_day();
        console.log("Crawling xml_schedule_3_day DB sau 12h4PM ...");
    });

    schedule.scheduleJob("cron-xml_schedule_yesterday-12h4PM", "12 12 * * *", async () => {
        await xml_schedule_yesterday();
        console.log("Crawling xml_schedule_yesterday DB sau 12h12PM ...");
    });

    //DB
    // schedule.scheduleJob("cron-getScheduleday1-12h6PM", "6 12 * * *", async () => {
    //     await getScheduleday1();
    //     console.log("Crawling getScheduleday1 DB sau 12h6PM ...");
    // });

    schedule.scheduleJob("cron-getScheduleday2-12h8PM", "8 12 * * *", async () => {
        await getScheduleday2();
        console.log("Crawling getScheduleday2 DB sau 12h8PM ...");
    });

    schedule.scheduleJob("cron-getScheduleday3-12h10PM", "10 12 * * *", async () => {
        await getScheduleday3();
        console.log("Crawling getScheduleday3 DB sau 12h10PM ...");
    });

    schedule.scheduleJob("cron-deleteOdds-12h14PM", "14 12 * * *", async () => {
        await deleteOdds();
        console.log("Crawling deleteOdds DB sau 12h14p ...");
    });
}