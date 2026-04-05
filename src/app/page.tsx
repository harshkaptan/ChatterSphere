"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Upload,
  Sun,
  Moon,
  Pencil,
  Check,
  X,
  FileText,
  Bot,
  User,
  Trash2,
  Image,
  FileSpreadsheet,
  Presentation,
} from "lucide-react";

/* Custom AI Logo – a minimal chat-bubble brain inspired by Claude/ChatGPT style */
function AiLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="6" width="40" height="32" rx="10" fill="white" fillOpacity="0.2" />
      <circle cx="24" cy="20" r="3" fill="white" />
      <circle cx="16" cy="16" r="2" fill="white" fillOpacity="0.8" />
      <circle cx="32" cy="16" r="2" fill="white" fillOpacity="0.8" />
      <circle cx="18" cy="26" r="2" fill="white" fillOpacity="0.8" />
      <circle cx="30" cy="26" r="2" fill="white" fillOpacity="0.8" />
      <line x1="18" y1="16" x2="22" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="30" y1="16" x2="26" y2="19" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="19.5" y1="25" x2="22" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="28.5" y1="25" x2="26" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M14 38 L10 44 L20 38" fill="white" fillOpacity="0.2" />
    </svg>
  );
}

/* Larger welcome logo with glow */
function WelcomeLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="40" cy="40" r="38" fill="url(#glow)" fillOpacity="0.15" />
      <rect x="12" y="14" width="56" height="44" rx="14" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
      <circle cx="40" cy="34" r="5" fill="white" />
      <circle cx="26" cy="28" r="3" fill="white" fillOpacity="0.7" />
      <circle cx="54" cy="28" r="3" fill="white" fillOpacity="0.7" />
      <circle cx="30" cy="44" r="3" fill="white" fillOpacity="0.7" />
      <circle cx="50" cy="44" r="3" fill="white" fillOpacity="0.7" />
      <line x1="29" y1="29" x2="36" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="51" y1="29" x2="44" y2="33" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="32" y1="43" x2="37" y2="37" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="48" y1="43" x2="43" y2="37" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      <circle cx="40" cy="34" r="8" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M20 58 L14 68 L32 58" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
      <defs>
        <radialGradient id="glow">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  isFile?: boolean;
  fileName?: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

type FileType = "pdf" | "image" | "docx" | "pptx" | "unknown";

const SUPPORTED_EXTENSIONS: Record<string, FileType> = {
  ".pdf": "pdf",
  ".jpg": "image",
  ".jpeg": "image",
  ".png": "image",
  ".webp": "image",
  ".gif": "image",
  ".bmp": "image",
  ".doc": "docx",
  ".docx": "docx",
  ".ppt": "pptx",
  ".pptx": "pptx",
};

const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,.doc,.docx,.ppt,.pptx";

function getFileType(fileName: string): FileType {
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] || "unknown";
}

function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case "pdf":
      return <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-red-500" />;
    case "image":
      return <Image className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-green-500" />;
    case "docx":
      return <FileSpreadsheet className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-blue-500" />;
    case "pptx":
      return <Presentation className="w-4 h-4 inline-block mr-1.5 -mt-0.5 text-orange-500" />;
    default:
      return <FileText className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />;
  }
}

const SUGGESTIONS = [
  { icon: "📄", text: "Summarize my document", prompt: "Please summarize the uploaded document." },
  { icon: "🔍", text: "Find key points", prompt: "What are the key points in this document?" },
  { icon: "💡", text: "Explain a concept", prompt: "Explain the main concept discussed in this document." },
  { icon: "📝", text: "Generate notes", prompt: "Generate study notes from this document." },
];

export default function ChatBotUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [docContent, setDocContent] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY?.trim();
  const MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.1-8b-instant";
  const ENDPOINT = API_KEY
    ? "https://api.groq.com/openai/v1/chat/completions"
    : null;
  const hasApiConfigured = Boolean(ENDPOINT);

  useEffect(() => {
    const loadPdfJs = async () => {
      if (!window.pdfjsLib) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        };
        document.body.appendChild(script);
      }
    };
    loadPdfJs();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      const prefersDark = storedTheme === "dark";
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- File Parsers ---

  const parsePdfFile = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      text += `Page ${i}: ${pageText}\n\n`;
    }
    return text;
  }, []);

  const parseImageFile = useCallback(async (file: File): Promise<string> => {
    const Tesseract = await import("tesseract.js");
    const { data } = await Tesseract.recognize(file, "eng");
    if (!data.text.trim()) {
      return "[Image uploaded — no readable text found via OCR. The image may contain graphics, charts, or handwritten content.]";
    }
    return `[OCR extracted text from image]:\n\n${data.text}`;
  }, []);

  const parseDocxFile = useCallback(async (file: File): Promise<string> => {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (!result.value.trim()) {
      return "[Document uploaded — no readable text content found.]";
    }
    return result.value;
  }, []);

  const parsePptxFile = useCallback(async (file: File): Promise<string> => {
    const JSZip = (await import("jszip")).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const slideFiles = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });

    if (slideFiles.length === 0) {
      return "[Presentation uploaded — no slide content found.]";
    }

    let fullText = "";
    for (const slidePath of slideFiles) {
      const slideXml = await zip.files[slidePath].async("string");
      // Extract text from XML tags <a:t>...</a:t>
      const textMatches = slideXml.match(/<a:t>([^<]*)<\/a:t>/g);
      if (textMatches) {
        const slideNum = slidePath.match(/slide(\d+)/)?.[1];
        const slideText = textMatches
          .map((match) => match.replace(/<\/?a:t>/g, ""))
          .join(" ");
        fullText += `Slide ${slideNum}: ${slideText}\n\n`;
      }
    }

    return fullText || "[Presentation uploaded — no readable text found in slides.]";
  }, []);

  const parseFile = useCallback(
    async (file: File): Promise<string> => {
      const fileType = getFileType(file.name);
      switch (fileType) {
        case "pdf":
          return parsePdfFile(file);
        case "image":
          return parseImageFile(file);
        case "docx":
          return parseDocxFile(file);
        case "pptx":
          return parsePptxFile(file);
        default:
          throw new Error("Unsupported file type.");
      }
    },
    [parsePdfFile, parseImageFile, parseDocxFile, parsePptxFile]
  );

  // --- Core Logic ---

  const sendToBot = async (textToSend: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    if (!ENDPOINT) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Missing Groq API key. Add NEXT_PUBLIC_GROQ_API_KEY in .env.local and restart the server.",
          sender: "bot",
        },
      ]);
      setIsTyping(false);
      return;
    }

    try {
      const history = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      let fullPrompt = textToSend;
      if (docContent) {
        fullPrompt = `Answer this based on the uploaded document content:\n\n${docContent}\n\nQuestion: ${textToSend}`;
      }

      history.push({ role: "user", content: fullPrompt });

      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: history,
          temperature: 0.7,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const apiError =
          data?.error?.message ||
          `Groq API request failed with status ${response.status}.`;
        throw new Error(apiError);
      }

      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("AI returned an empty response.");

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text, sender: "bot" },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error contacting AI.";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 2, text: errorMessage, sender: "bot" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (editId !== null) {
      const updatedMessages = messages.map((msg) =>
        msg.id === editId ? { ...msg, text: input } : msg
      );
      setMessages(updatedMessages);
      setEditId(null);
      setEditValue("");
      setInput("");
      await sendToBot(input);
      return;
    }

    const text = input;
    setInput("");
    await sendToBot(text);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = getFileType(file.name);
    if (fileType === "unknown") {
      alert(
        "Unsupported file type. Supported formats: PDF, JPG, PNG, DOCX, DOC, PPTX, PPT"
      );
      return;
    }

    const fileTypeLabels: Record<FileType, string> = {
      pdf: "PDF",
      image: "Image",
      docx: "Word Document",
      pptx: "Presentation",
      unknown: "File",
    };

    const label = fileTypeLabels[fileType];

    const userFileMessage: Message = {
      id: Date.now(),
      text: `Uploaded ${label}: ${file.name}`,
      sender: "user",
      isFile: true,
      fileName: file.name,
    };

    setMessages((prev) => [...prev, userFileMessage]);
    setIsProcessing(true);

    try {
      const extractedText = await parseFile(file);
      setDocContent(extractedText);
      setDocName(file.name);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: `I've processed "${file.name}" successfully! You can now ask me anything about its contents.`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Unknown error occurred.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: `Failed to process "${file.name}": ${errMsg}`,
          sender: "bot",
        },
      ]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const clearChat = () => {
    setMessages([]);
    setDocContent(null);
    setDocName(null);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-foreground transition-colors duration-500">
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 overflow-hidden">
                <AiLogo className="w-9 h-9" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                ChatterSphere
              </h1>
              <p className="text-xs text-muted-foreground">AI-Powered Document Chat</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {docName && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium mr-2">
                {getFileIcon(getFileType(docName))}
                <span className="max-w-[120px] truncate">{docName}</span>
              </div>
            )}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="text-muted-foreground hover:text-destructive rounded-xl"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="rounded-xl"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto overflow-hidden">
        {!hasApiConfigured && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Groq API key is missing. Add <code className="mx-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-xs font-mono">NEXT_PUBLIC_GROQ_API_KEY</code> to .env.local and restart.
          </div>
        )}

        {/* Messages or Welcome Screen */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 pt-4">
          {isEmpty ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/20 overflow-hidden">
                <WelcomeLogo className="w-16 h-16" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Welcome to ChatterSphere
              </h2>
              <p className="text-muted-foreground mb-2 max-w-md text-sm sm:text-base">
                Upload a document and start asking questions. I&apos;ll help you understand, summarize, and extract insights.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">PDF</span>
                <span className="px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">JPG / PNG</span>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">DOCX</span>
                <span className="px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium">PPTX</span>
              </div>

              {/* Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (hasApiConfigured) {
                        setInput(s.prompt);
                      }
                    }}
                    disabled={!hasApiConfigured}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm font-medium text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                      {s.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <ScrollArea className="h-full">
              <div className="space-y-4 pb-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Bot Avatar */}
                    {msg.sender === "bot" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div className="relative max-w-[75%]">
                      {editId === msg.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 rounded-xl"
                          />
                          <Button
                            size="icon"
                            onClick={handleSend}
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl"
                            onClick={() => {
                              setEditId(null);
                              setInput("");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`group relative p-3 sm:p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.sender === "user"
                              ? msg.isFile
                                ? "bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-800/50"
                                : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                              : "bg-white dark:bg-gray-800 border border-border/60 text-foreground shadow-sm"
                          }`}
                        >
                          {msg.isFile && msg.fileName && getFileIcon(getFileType(msg.fileName))}
                          {msg.text}
                          {msg.sender === "user" && !msg.isFile && (
                            <button
                              onClick={() => {
                                setEditId(msg.id);
                                setInput(msg.text);
                              }}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center border border-border/60"
                            >
                              <Pencil className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* User Avatar */}
                    {msg.sender === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mt-0.5">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Processing Indicator */}
                {isProcessing && (
                  <div className="flex gap-3 items-start animate-in fade-in duration-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                        Processing file...
                      </div>
                    </div>
                  </div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-start animate-in fade-in duration-300">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-border/60 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="px-4 sm:px-6 pb-4 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-2 rounded-2xl border border-border/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg shadow-black/5 dark:shadow-black/20"
          >
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors flex-shrink-0"
              aria-label="Upload file"
              disabled={!hasApiConfigured || isProcessing}
            >
              <Upload className="w-5 h-5" />
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasApiConfigured
                  ? docContent
                    ? `Ask about ${docName}...`
                    : "Type a message or upload a file..."
                  : "Set up Groq API key to start chatting"
              }
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
              disabled={!hasApiConfigured}
            />

            <Button
              type="submit"
              size="icon"
              disabled={!hasApiConfigured || !input.trim() || isTyping}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-md shadow-violet-500/25 transition-all duration-200 disabled:opacity-40 disabled:shadow-none flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
