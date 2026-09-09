/**
 * =========================================================================
 * BHROSA CAB - FCM NOTIFICATION SERVICE (fcmService.js)
 * =========================================================================
 * Equivalent to PHP ApiController::generateAccessToken()
 * Generates and manages short-lived OAuth2 Bearer Access Tokens for
 * Firebase Cloud Messaging (FCM) HTTP v1 API.
 * =========================================================================
 */

const fs = require("fs");
const path = require("path");
const { GoogleAuth } = require("google-auth-library");

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const DEFAULT_PROJECT_ID = "bharosacab";

let cachedAccessToken = null;
let tokenExpiryTimestamp = 0;
let detectedProjectId = DEFAULT_PROJECT_ID;

/**
 * Locate and parse the service account credentials.
 * Supports:
 * 1. Environment variable FIREBASE_SERVICE_ACCOUNT (raw JSON string or file path)
 * 2. Local file in backend/notificationSympa.json
 * 3. Local file in project root notificationSympa.json
 */
function getCredentials() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (raw.startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.project_id) detectedProjectId = parsed.project_id;
        return { credentials: parsed };
      } catch (err) {
        console.error("[FCM] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON env variable:", err.message);
      }
    } else if (fs.existsSync(raw)) {
      return { keyFile: raw };
    }
  }

  const candidatePaths = [
    path.resolve(process.cwd(), "notificationSympa.json"),
    path.resolve(__dirname, "../../notificationSympa.json"),
    path.resolve(__dirname, "../../../notificationSympa.json"),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(p, "utf8"));
        if (parsed.project_id) detectedProjectId = parsed.project_id;
        return { keyFile: p, credentials: parsed };
      } catch (e) {
        return { keyFile: p };
      }
    }
  }

  return null;
}

/**
 * Generates a fresh Google OAuth2 access token for FCM.
 * Equivalent to PHP: ApiController::generateAccessToken()
 */
async function generateAccessToken() {
  const credsConfig = getCredentials();

  if (!credsConfig) {
    const errorMsg =
      "[FCM] Service account file not found! Please place 'notificationSympa.json' in backend or set FIREBASE_SERVICE_ACCOUNT in .env";
    console.warn(errorMsg);
    throw new Error(errorMsg);
  }

  try {
    const authOptions = {
      scopes: [FCM_SCOPE],
    };

    if (credsConfig.credentials) {
      authOptions.credentials = credsConfig.credentials;
      if (credsConfig.credentials.project_id) {
        detectedProjectId = credsConfig.credentials.project_id;
      }
    } else if (credsConfig.keyFile) {
      authOptions.keyFile = credsConfig.keyFile;
    }

    const auth = new GoogleAuth(authOptions);
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();

    const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

    if (!token) {
      throw new Error("[FCM] Access Token could not be fetched from Google Auth!");
    }

    cachedAccessToken = token;
    tokenExpiryTimestamp = Date.now() + 55 * 60 * 1000;

    return token;
  } catch (error) {
    console.error("[FCM] generateAccessToken error:", error.message);
    throw error;
  }
}

/**
 * Returns a valid access token (using cache if still valid).
 */
async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiryTimestamp) {
    return cachedAccessToken;
  }
  return await generateAccessToken();
}

/**
 * Returns FCM HTTP v1 message sending endpoint.
 */
function getFcmEndpoint() {
  return `https://fcm.googleapis.com/v1/projects/${detectedProjectId}/messages:send`;
}

module.exports = {
  generateAccessToken,
  getAccessToken,
  getFcmEndpoint,
  getProjectId: () => detectedProjectId,
};
