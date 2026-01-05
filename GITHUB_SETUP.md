# How to Push to GitHub

Since Git is not available in your PowerShell environment, follow these steps to push your code to GitHub:

## Option 1: Using GitHub Desktop (Recommended)

1. **Download GitHub Desktop**
   - Go to https://desktop.github.com/
   - Download and install GitHub Desktop

2. **Add Your Repository**
   - Open GitHub Desktop
   - Click "File" → "Add Local Repository"
   - Browse to: `C:\Users\anasv\.gemini\antigravity\scratch\ssc-v2`
   - Click "Add Repository"

3. **Create Repository on GitHub**
   - Click "Publish repository" button
   - Repository name: `ssc-v2`
   - Description: "Smart Student Companion - AI Interview Platform"
   - Uncheck "Keep this code private" (or keep it checked if you want it private)
   - Click "Publish Repository"

4. **Done!**
   - Your code is now on GitHub at: `https://github.com/amoham11-coder/ssc-v2`

## Option 2: Using Git Bash

1. **Install Git**
   - Download from: https://git-scm.com/download/win
   - Install with default settings

2. **Open Git Bash**
   - Right-click in the `ssc-v2` folder
   - Select "Git Bash Here"

3. **Initialize and Push**
   ```bash
   # Initialize repository
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit: Smart Student Companion with Google Auth"
   
   # Create repository on GitHub first (via web interface)
   # Then connect and push:
   git remote add origin https://github.com/amoham11-coder/ssc-v2.git
   git branch -M main
   git push -u origin main
   ```

## Option 3: Using VS Code

1. **Open Folder in VS Code**
   - Open VS Code
   - File → Open Folder
   - Select: `C:\Users\anasv\.gemini\antigravity\scratch\ssc-v2`

2. **Initialize Git**
   - Click the Source Control icon (left sidebar)
   - Click "Initialize Repository"

3. **Commit Changes**
   - Stage all files (click + next to "Changes")
   - Enter commit message: "Initial commit: Smart Student Companion with Google Auth"
   - Click the checkmark to commit

4. **Publish to GitHub**
   - Click "Publish to GitHub"
   - Choose repository name: `ssc-v2`
   - Select Public or Private
   - Click "Publish"

## Important: Enable Google Sign-In in Firebase

Before testing, make sure to:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `smart-student-companion07`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Click **Enable**
6. Add your email as a test user
7. Click **Save**

## Testing Locally

After pushing to GitHub, test the app:

```bash
cd C:\Users\anasv\.gemini\antigravity\scratch\ssc-v2
npm run dev
```

The app will open at `http://localhost:3000` with Google Sign-In enabled!
