# 🚀 ChatterSphere Setup Guide

## ⚠️ Important: API Key Required

ChatterSphere requires a Google Gemini API key to function. Follow these steps to set it up:

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" or "Create API key"
4. Copy the generated API key

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root (same level as `package.json`)
2. Add your API key to the file:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_groq_api_key_here
```

**Example:**
```bash
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
```

### 3. Restart the Development Server

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Verify Setup

- The warning message should disappear
- You should be able to type in the chat input
- Upload and chat buttons should be enabled

## 🔧 Troubleshooting

### "AI failed to respond" Error
- ✅ Check that your API key is correct
- ✅ Ensure the `.env.local` file is in the project root
- ✅ Restart the development server after adding the file
- ✅ Verify your API key has proper permissions

### API Key Not Working
- Check if your API key is valid at [Google AI Studio](https://aistudio.google.com/)
- Ensure you have sufficient quota/credits
- Verify the API key format (should start with "AIzaSy")

## 📱 Features Available After Setup

- 🤖 AI-powered chat responses
- 📄 PDF upload and parsing
- 🧠 Contextual Q&A based on PDF content
- 🌙 Dark/light theme toggle
- ✏️ Message editing
- 📱 Responsive design

## 🚨 Security Note

- Never commit your `.env.local` file to version control
- The file is already in `.gitignore` for security
- Keep your API key private and secure
