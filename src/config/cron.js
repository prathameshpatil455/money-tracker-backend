import cron from "cron";
import https from "https";

const job = new cron.CronJob({
  cronTime: "*/14 * * * *",
  function() {
    https.get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) {
        console.log("API is running");
      }
      res.on("error", (error) => {
        console.log(error);
      });
    });
  },
});

export default job;
