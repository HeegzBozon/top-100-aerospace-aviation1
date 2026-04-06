/**
 * Claude Telegram Bot
 *
 * A Telegram bot powered by Claude (claude-opus-4-6).
 * Maintains per-user conversation history so Claude remembers context.
 *
 * Setup:
 *   1. Create a bot via @BotFather on Telegram → get TELEGRAM_BOT_TOKEN
 *   2. Get your Anthropic API key → ANTHROPIC_API_KEY
 *   3. Run:  TELEGRAM_BOT_TOKEN=xxx ANTHROPIC_API_KEY=xxx node scripts/telegram-bot.mjs
 *
 * Commands:
 *   /start  — welcome message
 *   /help   — usage instructions
 *   /clear  — clear conversation history
 */

import TelegramBot from "node-telegram-bot-api";
import Anthropic from "@anthropic-ai/sdk";

// ── Config ────────────────────────────────────────────────────────────────────

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!TELEGRAM_TOKEN) {
  console.error("Error: TELEGRAM_BOT_TOKEN environment variable is required.");
  process.exit(1);
}
if (!ANTHROPIC_KEY) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is required.");
  process.exit(1);
}

const MODEL = "claude-opus-4-6";
const MAX_HISTORY = 20; // max messages kept per user (user+assistant pairs)

const SYSTEM_PROMPT = `You are a helpful assistant for the TOP 100 Aerospace & Aviation platform — a reputation-weighted professional network for women in aerospace and aviation. You help users learn about the platform, answer questions about aerospace and aviation, and provide thoughtful, professional responses. Keep responses concise and suitable for a chat interface.`;

// ── State ─────────────────────────────────────────────────────────────────────

/** @type {Map<number, Array<{role: string, content: string}>>} */
const conversations = new Map();

// ── Clients ───────────────────────────────────────────────────────────────────

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────

function getHistory(userId) {
  if (!conversations.has(userId)) {
    conversations.set(userId, []);
  }
  return conversations.get(userId);
}

function addToHistory(userId, role, content) {
  const history = getHistory(userId);
  history.push({ role, content });
  // Trim to MAX_HISTORY messages (keep most recent)
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }
}

function clearHistory(userId) {
  conversations.set(userId, []);
}

async function askClaude(userId, userMessage) {
  addToHistory(userId, "user", userMessage);
  const messages = getHistory(userId);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    thinking: { type: "adaptive" },
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const reply = textBlock?.text ?? "(No response)";

  addToHistory(userId, "assistant", reply);
  return reply;
}

// Escape special characters for Telegram MarkdownV2
function escapeMarkdown(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

// Send a message, falling back to plain text if Markdown fails
async function sendReply(chatId, text) {
  try {
    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  } catch {
    await bot.sendMessage(chatId, text);
  }
}

// ── Command handlers ──────────────────────────────────────────────────────────

bot.onText(/\/start/, async (msg) => {
  const name = msg.from?.first_name ?? "there";
  const welcome = `👋 Hello, ${name}! I'm the TOP 100 Aerospace & Aviation assistant, powered by Claude.\n\nAsk me anything about the platform or aerospace & aviation in general.\n\nType /help for more info.`;
  await sendReply(msg.chat.id, welcome);
});

bot.onText(/\/help/, async (msg) => {
  const help = `*How to use this bot:*\n\n• Just send me a message and I'll respond using Claude.\n• I remember your conversation — you can ask follow-up questions.\n• /clear — start a fresh conversation\n• /help — show this message`;
  await sendReply(msg.chat.id, help);
});

bot.onText(/\/clear/, async (msg) => {
  clearHistory(msg.from.id);
  await sendReply(msg.chat.id, "✅ Conversation history cleared. Fresh start!");
});

// ── Message handler ───────────────────────────────────────────────────────────

bot.on("message", async (msg) => {
  // Ignore commands (handled above) and non-text messages
  if (!msg.text || msg.text.startsWith("/")) return;

  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Show "typing..." indicator
  await bot.sendChatAction(chatId, "typing");

  try {
    const reply = await askClaude(userId, msg.text);
    await sendReply(chatId, reply);
  } catch (err) {
    console.error("Claude API error:", err);
    const errorText =
      err instanceof Anthropic.RateLimitError
        ? "⚠️ Rate limit reached. Please wait a moment and try again."
        : err instanceof Anthropic.AuthenticationError
          ? "⚠️ API key error. Please contact the administrator."
          : "⚠️ Something went wrong. Please try again.";
    await sendReply(chatId, errorText);
  }
});

// ── Startup ───────────────────────────────────────────────────────────────────

bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});

console.log(`✅ Claude Telegram Bot is running (model: ${MODEL})`);
console.log("   Press Ctrl+C to stop.");
