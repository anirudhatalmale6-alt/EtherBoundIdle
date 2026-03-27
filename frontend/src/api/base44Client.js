const DEFAULT_API_URL = 'http://46.224.121.242:3000';
const API_URL_KEY = 'eb_api_url';

function getApiUrl() {
  try { return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL; } catch { return DEFAULT_API_URL; }
}

function setApiUrl(url) {
  try { localStorage.setItem(API_URL_KEY, url); } catch {}
}

const subscribers = {};

function notifySubscribers(entityName, event) {
  const subs = subscribers[entityName];
  if (!subs) return;
  for (const cb of subs) {
    try { cb(event); } catch {}
  }
}

async function apiFetch(path, options = {}) {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const sid = localStorage.getItem('eb_session_id');
  if (sid) headers['Authorization'] = `Bearer ${sid}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

function createEntityProxy(entityName) {
  return {
    async create(data) {
      return apiFetch(`/entities/${entityName}`, { method: 'POST', body: JSON.stringify(data) });
    },
    async get(id) {
      return apiFetch(`/entities/${entityName}/${id}`);
    },
    async filter(query = {}, sort, limit) {
      const params = new URLSearchParams();
      if (query && Object.keys(query).length) params.set('filter', JSON.stringify(query));
      if (sort) params.set('sort', sort);
      if (limit) params.set('limit', String(limit));
      const qs = params.toString();
      return apiFetch(`/entities/${entityName}${qs ? '?' + qs : ''}`);
    },
    async list(sort, limit) {
      return this.filter({}, sort, limit);
    },
    async update(id, data) {
      return apiFetch(`/entities/${entityName}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    async delete(id) {
      return apiFetch(`/entities/${entityName}/${id}`, { method: 'DELETE' });
    },
    subscribe(callback) {
      if (!subscribers[entityName]) subscribers[entityName] = new Set();
      subscribers[entityName].add(callback);
      let active = true;
      let timeout;
      const poll = () => {
        if (!active) return;
        try { callback({ type: 'poll' }); } catch {}
        timeout = setTimeout(poll, 15000);
      };
      timeout = setTimeout(poll, 15000);
      return () => {
        active = false;
        if (timeout) clearTimeout(timeout);
        subscribers[entityName]?.delete(callback);
      };
    },
  };
}

const entityNames = [
  'Character', 'Item', 'Guild', 'Quest', 'Trade',
  'Party', 'PartyActivity', 'PartyInvite', 'Presence',
  'PlayerSession', 'ChatMessage', 'Mail', 'Resource',
  'FriendRequest', 'Friendship', 'TradeSession',
  'DungeonSession', 'GemLab', 'PrivateMessage',
];

const entities = {};
entityNames.forEach(name => {
  entities[name] = createEntityProxy(name);
});

export const base44 = {
  entities,

  functions: {
    async invoke(functionName, params = {}) {
      const result = await apiFetch(`/functions/${functionName}`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return { data: result.data || result };
    },
  },

  auth: {
    async me() {
      try {
        return await apiFetch('/auth/user');
      } catch {
        return null;
      }
    },
    async register(data) {
      const result = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (result.sessionId) {
        localStorage.setItem('eb_session_id', result.sessionId);
      }
      return result;
    },
    async login(data) {
      const result = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (result.sessionId) {
        localStorage.setItem('eb_session_id', result.sessionId);
      }
      return result;
    },
    async logout() {
      try {
        await apiFetch('/logout', { method: 'POST' });
      } catch {}
      localStorage.removeItem('eb_session_id');
    },
  },

  async testConnection() {
    const url = getApiUrl();
    try {
      const res = await fetch(`${url}/api/test`);
      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getMode() { return 'server'; },
  setMode() {},
  getApiUrl,
  setApiUrl,
};

export default base44;
