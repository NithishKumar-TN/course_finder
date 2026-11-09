import express from "express";
const router = express.Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "LearnMate API",
    timestamp: new Date().toISOString(),
    model: process.env.GRANITE_MODEL_ID || "ibm/granite-3-8b-instruct",
    watsonxUrl: process.env.WATSONX_URL || "not set",
  });
});

export default router;
