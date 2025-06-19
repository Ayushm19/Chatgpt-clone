import { MessagePayload } from "@/types"

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // On client, use relative path
    return "";
  }
  // On server, use absolute URL
  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SITE_URL!;
}

export async function sendMessage(message: MessagePayload) {
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

// New function to stream AI response from /api/chat
export async function streamChat(messages: MessagePayload[]) {
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok || !res.body) {
    throw new Error("Failed to fetch chat stream");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}
