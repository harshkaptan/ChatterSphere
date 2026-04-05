# ChatterSphere Setup Guide

## Important: API Key Required

ChatterSphere requires a Groq API key to function. Follow these steps to set it up:

### 1. Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign in or create an account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root (same level as `package.json`)
2. Add your API key to the file:

```bash
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_GROQ_MODEL=llama-3.1-8b-instant
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

## Troubleshooting

### "AI failed to respond" Error
- Check that your API key is correct
- Ensure the `.env.local` file is in the project root
- Restart the development server after adding the file
- Verify your API key has proper permissions

### API Key Not Working
- Check if your API key is valid at [Groq Console](https://console.groq.com/)
- Ensure you have sufficient quota
- Verify the API key format (should start with "gsk_")

## Features Available After Setup

- AI-powered chat responses
- PDF, DOCX, PPTX, and Image (JPG/PNG) upload and parsing
- OCR text extraction from images
- Contextual Q&A based on document content
- Dark/light theme toggle
- Message editing
- Responsive design

## Security Note

- Never commit your `.env.local` file to version control
- The file is already in `.gitignore` for security
- Keep your API key private and secure
