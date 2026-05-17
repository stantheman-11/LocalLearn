// ── Configuration ──────────────────────────────────────────────
// Add your Anthropic API key here. For a real deployment, move this
// to a backend so the key isn't exposed in the browser.
const API_KEY = "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";

// Each hub page sets window.HUB_PROMPT before this script loads
const SYSTEM_PROMPT = window.HUB_PROMPT || "You are a helpful assistant for LocalLearn, a resource hub for teens in Los Angeles. Keep responses concise and friendly. Do not use any markdown formatting — no asterisks, no hyphens as bullet points, no headers, no bold or italic syntax. Write in plain prose only.";

// ── State ───────────────────────────────────────────────────────
const messages = [];

// ── DOM refs ────────────────────────────────────────────────────
const chatWindow = document.getElementById("chatWindow");
const chatForm   = document.getElementById("chatForm");
const chatInput  = document.getElementById("chatInput");
const sendBtn    = document.getElementById("sendBtn");

// ── Helpers ─────────────────────────────────────────────────────

function appendMessage(role, text) {
  const div = document.createElement("div");
  div.className = `chat-message ${role}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return div;
}

// ── Send message ────────────────────────────────────────────────

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = chatInput.value.trim();
  if (!userText) return;

  // Show user message
  appendMessage("user", userText);
  messages.push({ role: "user", content: userText });
  chatInput.value = "";
  sendBtn.disabled = true;

  // Show thinking indicator
  const thinking = appendMessage("assistant thinking", "Thinking…");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.content[0].text;

    // Replace thinking bubble with actual reply
    thinking.textContent = replyText;
    thinking.className = "chat-message assistant";

    messages.push({ role: "assistant", content: replyText });

  } catch (err) {
    thinking.textContent = "Something went wrong. Check your API key in chatbot.js.";
    thinking.className = "chat-message assistant";
    console.error(err);
  }

  sendBtn.disabled = false;
  chatInput.focus();
});
