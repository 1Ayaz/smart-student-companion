import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env");
const envContent = fs.readFileSync(envPath, "utf8");
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            const allNames = data.models.map(m => m.name.split("/").pop());
            const geminis = allNames.filter(n => n.startsWith("gemini"));
            console.log("=== ALL GEMINI MODELS ===");
            console.log(geminis.join(" | "));
        }
    } catch (error) {
        console.error("ERROR: " + error.message);
    }
}
listModels();
