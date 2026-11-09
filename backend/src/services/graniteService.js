import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

/**
 * IBM watsonx.ai / Granite service
 * Uses the Chat Completions API (/ml/v1/text/chat) which is confirmed
 * working with ibm/granite-4-h-small on IBM Cloud Lite.
 */

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Fetch (or return cached) IBM Cloud IAM access token.
 */
async function getIBMAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const params = new URLSearchParams();
  params.append("grant_type", "urn:ibm:params:oauth:grant-type:apikey");
  params.append("apikey", process.env.WATSONX_API_KEY);

  const { data } = await axios.post(
    process.env.IBM_IAM_URL || "https://iam.cloud.ibm.com/identity/token",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  cachedToken = data.access_token;
  // Refresh 5 min before expiry
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

/**
 * Call IBM Granite via watsonx.ai Chat Completions endpoint.
 * @param {string} systemMessage  - System prompt
 * @param {string} userMessage    - User message
 * @param {object} params         - Optional model parameters
 * @returns {string}              - Generated assistant reply
 */
export async function generateWithGranite(systemMessage, userMessage, params = {}) {
  const token = await getIBMAccessToken();
  const modelId = process.env.GRANITE_MODEL_ID || "ibm/granite-4-h-small";
  const projectId = process.env.WATSONX_PROJECT_ID;
  const baseUrl = process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com";

  const payload = {
    model_id: modelId,
    project_id: projectId,
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    parameters: {
      max_new_tokens: params.max_new_tokens || 500,
      temperature: params.temperature || 0.7,
      top_p: params.top_p || 0.9,
      repetition_penalty: params.repetition_penalty || 1.1,
    },
  };

  const { data } = await axios.post(
    `${baseUrl}/ml/v1/text/chat?version=2023-05-29`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return data.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * Legacy wrapper kept for backward compatibility with agentService.js.
 * agentService calls generateWithGranite(prompt, params) with a single
 * formatted string — this splits it back into system/user parts.
 */
export function buildGranitePrompt(systemMessage, userMessage) {
  // Return a structured object that agentService passes through
  return { systemMessage, userMessage };
}
