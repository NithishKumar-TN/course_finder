export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // IBM watsonx.ai API errors
  if (err.response?.data) {
    const { status_code, errors } = err.response.data;
    if (status_code === 401) {
      return res.status(401).json({ error: "IBM Cloud authentication failed. Check your API key." });
    }
    if (status_code === 403) {
      return res.status(403).json({ error: "Access denied to IBM watsonx.ai. Check your project ID and permissions." });
    }
    if (errors) {
      return res.status(502).json({ error: `IBM Granite API error: ${errors[0]?.message || "Unknown error"}` });
    }
  }

  // IAM token errors
  if (err.message?.includes("IAM") || err.message?.includes("apikey")) {
    return res.status(401).json({ error: "IBM IAM authentication error. Verify your WATSONX_API_KEY in .env" });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}
