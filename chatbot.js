// ── Configuration ──────────────────────────────────────────────
// Add your Anthropic API key here. For a real deployment, move this
// to a backend so the key isn't exposed in the browser.
const API_KEY = "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";

const SYSTEM_PROMPT = `You are a helpful assistant for LocalLearn, a resource hub for teens in the Los Angeles area who are interested in film.

Your job is to give personalized, concrete recommendations based on what the user tells you about their interests, experience level, and goals.

Focus on:
- Films and filmmakers to explore based on their taste
- Free or low-cost local LA opportunities (Kanopy, library resources, Academy Museum, TeenTix, film festivals)
- Practical next steps for someone who wants to start making films
- Books, publications, and online resources appropriate for their level

Keep responses concise and friendly. Do not use any markdown formatting — no asterisks, no hyphens as bullet points, no headers, no bold or italic syntax. Write in plain prose only. Don't be generic — ask follow-up questions if needed to give better recommendations.`;

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
