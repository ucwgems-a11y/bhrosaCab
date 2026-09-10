/**
 * FCM Notification Service
 * Handles OAuth2 Bearer token generation and push notifications via FCM HTTP v1 API.
 */

const fs = require("fs");
const path = require("path");
let GoogleAuth;
try {
  GoogleAuth = require("google-auth-library").GoogleAuth;
} catch (e) {
  console.warn("Warning: google-auth-library not immediately available:", e.message);
}

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

    if (!GoogleAuth) {
      try {
        GoogleAuth = require("google-auth-library").GoogleAuth;
      } catch (err) {
        throw new Error("google-auth-library is required for FCM notifications: " + err.message);
      }
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

/**
 * Sends a push notification via Firebase Cloud Messaging HTTP v1 API.
 * Equivalent to PHP: ApiController::sendNotification($deviceToken, $title, $body)
 *
 * @param {string} deviceToken - Target FCM registration token
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @returns {Promise<object>} FCM API response
 */
async function sendNotification(deviceToken, title, body) {
  if (!deviceToken) {
    throw new Error("Device token is required to send notification.");
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Access Token is not available. Please generate it first.");
  }

  const url = getFcmEndpoint();

  const payload = {
    message: {
      token: deviceToken,
      notification: {
        title: title || "",
        body: body || "",
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorText = responseData ? JSON.stringify(responseData) : await response.text().catch(() => "");
    throw new Error(`FCM API returned HTTP status code ${response.status}. Response: ${errorText}`);
  }

  return responseData;
}

/**
 * Controller handler for testing FCM notification.
 * Equivalent to PHP: ApiController::testNotification(Request $request)
 */
async function testNotification(req, res) {
  try {
    const deviceToken = req.body?.reg_id || req.query?.reg_id;
    if (!deviceToken) {
      return res.status(400).json({ error: "Device token is required" });
    }

    const title = "Test Notification";
    const body = "This is a test message from Firebase Cloud Messaging.";

    await sendNotification(deviceToken, title, body);

    return res.status(200).json({
      message: "Notification sent successfully",
    });
  } catch (e) {
    return res.status(500).json({
      error: e.message,
    });
  }
}

module.exports = {
  generateAccessToken,
  getAccessToken,
  getFcmEndpoint,
  sendNotification,
  testNotification,
  getProjectId: () => detectedProjectId,
};

