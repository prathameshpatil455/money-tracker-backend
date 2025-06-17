import { CronJob } from "cron";
import { sendDailyMotivation } from "../utils/sendDailyMotivation.js";

const motivationJob = new CronJob(
  //   "0 9 * * *", // Every day at 9:00 AM
  "* * * * *",
  async () => {
    console.log("🚀 Running daily motivation job...");
    await sendDailyMotivation();
  },
  null,
  false, // start the job automatically
  "Asia/Kolkata"
);

export default motivationJob;
