// AWS Serverless Integration - Zone B: AI Brain
const AWS_API_URL = import.meta.env.VITE_AWS_INVOKE_URL || "https://61w9dex8k2.execute-api.ap-south-2.amazonaws.com";

/**
 * Upload Resume to AWS S3 via Lambda
 * Sends fileName and fileType to get presigned URL, then uploads to S3.
 */
export async function uploadFileToAWS(file) {
    try {
        const cleanUrl = AWS_API_URL.replace(/\/$/, "");
        const targetUrl = `${cleanUrl}/upload`;

        console.log('📤 Requesting presigned URL from:', targetUrl);
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type || 'application/pdf',
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to get presigned URL: ${response.status}`);
        }

        // Backend returns uploadURL and sessionId
        const { uploadURL, sessionId } = await response.json();
        console.log('✅ Got presigned URL for session:', sessionId);

        // Step 2: Upload to S3 using presigned URL
        console.log('📤 Uploading to S3...');
        const uploadResponse = await fetch(uploadURL, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type || 'application/pdf',
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`S3 upload failed: ${uploadResponse.status}`);
        }

        console.log('✅ Upload successful!');
        return { sessionId, success: true };

    } catch (error) {
        console.error('❌ Upload Error:', error);
        throw error;
    }
}

/**
 * Fetch AI Response from AWS Lambda + Bedrock
 * Sends user's question and receives AI-generated response
 */
export const fetchAIResponse = async (sessionId, userMessage) => {
    try {
        console.log("🤖 Sending message to AI...");

        const response = await fetch(`${AWS_API_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sessionId: sessionId,
                text: userMessage
            })
        });

        if (!response.ok) {
            throw new Error(`AI request failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Received AI response");

        return {
            text: data.response || data.text,
            audioUrl: data.audioUrl || null,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error("❌ AI Response Failed:", error);
        throw error;
    }
};

/**
 * Get interview session status
 */
export const getSessionStatus = async (sessionId) => {
    try {
        const response = await fetch(`${AWS_API_URL}/session/${sessionId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get session status: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Session status check failed:", error);
        throw error;
    }
};

// --- START DIAGNOSTIC TOOL ---
/**
 * Run this in your browser console: await testAWSConnection()
 */
export async function testAWSConnection() {
    const url = (import.meta.env.VITE_AWS_INVOKE_URL || "https://61w9dex8k2.execute-api.ap-south-2.amazonaws.com").replace(/\/$/, "");
    console.log("🔍 DIAGNOSING AWS CONNECTION...");
    console.log("Target URL Base:", url);

    try {
        console.log("Step 1: Pinging /upload (POST)...");
        const res = await fetch(`${url}/upload`, {
            method: "POST",
            mode: 'cors',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        console.log("Response Status:", res.status);
        if (res.status === 404) {
            console.error("🔴 RESULT: 404 Not Found. Your URL is missing a 'Stage' name (e.g., /prod or /dev).");
        } else if (res.ok) {
            console.log("🟢 RESULT: Success! The endpoint is reachable.");
        } else {
            console.warn("🟡 RESULT: Received status", res.status);
        }
    } catch (e) {
        if (e.message.includes("fetch")) {
            console.error("🔴 RESULT: CORS Blocked. Your AWS API Gateway is not allowing requests from this domain.");
            console.log("Fix: Go to AWS Console -> API Gateway -> CORS -> Enable CORS and Deploy the API.");
        } else {
            console.error("🔴 RESULT: Unknown Error:", e.message);
        }
    }
}
window.testAWSConnection = testAWSConnection;
// --- END DIAGNOSTIC TOOL ---

export default {
    uploadFileToAWS,
    fetchAIResponse,
    getSessionStatus,
    testAWSConnection
};
