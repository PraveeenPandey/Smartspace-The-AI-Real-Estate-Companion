const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error(
      "Network request failed. Check that the backend is running and CORS allows the React app origin.",
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export function sendChatMessage(payload) {
  return request("/chat/message", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchSessionDetail(sessionId) {
  return request(`/chat/sessions/${sessionId}`);
}

export function fetchRecommendations(payload) {
  return request("/recommendations/search", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createListing(payload) {
  return request("/listings/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function analyzeDocument(payload) {
  return request("/documents/analyze", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminOverview() {
  return request("/admin/overview");
}
