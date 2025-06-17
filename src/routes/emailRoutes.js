import express from "express";
import {
  sendTestEmail,
  sendWeeklyEmails,
  sendMonthlyEmails,
} from "../controllers/emailController.js";

const router = express.Router();

router.post("/test", sendTestEmail);
router.post("/weekly", sendWeeklyEmails);
router.post("/monthly", sendMonthlyEmails);

export default router;
