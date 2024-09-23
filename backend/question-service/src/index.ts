import express from "express";
import router from "../routes/routes.js";

const app = express();

app.use(express.json());
app.use("/api/questions", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Question Service is running on port ${PORT}`);
});
