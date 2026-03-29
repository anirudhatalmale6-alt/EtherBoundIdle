const API_BASE = "http://46.224.121.242:3000/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "API Fehler");
  }

  return data;
}

export const base44 = {
  auth: {
    async login(data) {
      return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async me() {
      return apiFetch("/auth/user");
    },
  },
};

export default base44;
