const API_URL = "";

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    headers,
    ...options,
  });

  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.error || "API Error");
  }

  return data.data ?? data;
}

// ------------------
// AUTH
// ------------------

export const auth = {
  async login(email, password) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(email, password) {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async me() {
    try {
      return await apiFetch("/auth/user");
    } catch {
      return null;
    }
  },

  async logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    window.location.reload();
  },
};

// ------------------
// API
// ------------------

export const api = {
  async callFunction(name, params = {}) {
    return apiFetch(`/functions/${name}`, {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  async getEntity(name, id) {
    return apiFetch(`/entities/${name}/${id}`);
  },

  async listEntities(name) {
    return apiFetch(`/entities/${name}`);
  },

  async createEntity(name, body) {
    return apiFetch(`/entities/${name}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async updateEntity(name, id, body) {
    return apiFetch(`/entities/${name}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  async deleteEntity(name, id) {
    return apiFetch(`/entities/${name}/${id}`, {
      method: "DELETE",
    });
  },

  async filterEntities(name, query = {}, sort, limit) {
    const params = new URLSearchParams();
    if (Object.keys(query).length) {
      params.set("filter", JSON.stringify(query));
    }
    if (sort) params.set("sort", sort);
    if (limit) params.set("limit", String(limit));

    return apiFetch(`/entities/${name}?${params.toString()}`);
  },
};
