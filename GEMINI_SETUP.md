# Setting Up Gemini AI for Study Planner

## Quick Setup Guide

### Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Your Environment

1. In your project root (`ssc-v3` folder), create a file named `.env`:
   ```bash
   # On Windows (PowerShell)
   cd ssc-v3
   New-Item .env
   ```

2. Open the `.env` file and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   Replace `your_actual_api_key_here` with the API key you copied from Google AI Studio.

### Step 3: Restart the Development Server

If your dev server is running, restart it to load the new environment variable:

```bash
# Stop the server (Ctrl+C)
# Then start it again
npm run dev
```

## Features Enabled

Once configured, you'll have access to:

### 1. **Study Planner** 📚
- AI-generated personalized study schedules
- Customized based on:
  - Your subjects
  - Exam dates
  - Current knowledge level
  - Available study time per day
- Interactive calendar view
- Progress tracking
- Save multiple study plans

### 2. **Enhanced AI Tutor** 🤖
- Real AI responses (no more simulated answers!)
- Context-aware conversations
- Detailed explanations
- Practice problems and examples
- Homework help

## Troubleshooting

### "Gemini AI is not configured" Error

**Problem:** The app can't find your API key.

**Solutions:**
1. Make sure the `.env` file is in the `ssc-v3` folder (same level as `package.json`)
2. Check that the variable name is exactly `VITE_GEMINI_API_KEY`
3. Restart your development server after creating/editing `.env`
4. Make sure there are no spaces around the `=` sign

### "Failed to generate study plan" Error

**Problem:** API call failed.

**Solutions:**
1. Verify your API key is correct
2. Check your internet connection
3. Make sure you haven't exceeded the free tier limits (60 requests/minute)
4. Check the browser console for detailed error messages

### API Key Not Working

**Problem:** Invalid API key error.

**Solutions:**
1. Go back to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Delete the old key and create a new one
3. Update your `.env` file with the new key
4. Restart the dev server

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to Git (it's already in `.gitignore`)
- Never share your API key publicly
- If you accidentally expose your key, delete it immediately and create a new one

## Cost Information

Gemini API Pricing (Free Tier):
- **60 requests per minute** - Free
- **1,500 requests per day** - Free

For typical usage (study plans + tutor questions), you should stay well within the free tier.

## Example Usage

### Creating a Study Plan

1. Navigate to **Study Planner** from the dashboard
2. Add your subjects (e.g., "Mathematics", "Physics")
3. Select your exam date
4. Choose your current knowledge level
5. Set study hours per day
6. Click "Generate Study Plan"
7. Wait 10-15 seconds for AI to create your personalized schedule
8. Review and save your plan

### Using AI Tutor

1. Navigate to **AI Tutor** from the dashboard
2. Ask any question about your studies
3. Get detailed, helpful responses
4. Continue the conversation for follow-up questions

## Need Help?

If you're still having issues:
1. Check the browser console (F12) for error messages
2. Make sure you're using the latest version of the code
3. Try clearing your browser cache
4. Restart both the dev server and your browser

---

**Happy Studying! 📖✨**
