import "dotenv/config";
import app from "./src/app.js";
import { startReminderJob } from "./src/lib/reminder.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderJob();
});