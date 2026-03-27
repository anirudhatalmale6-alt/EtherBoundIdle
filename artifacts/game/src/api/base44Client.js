const DEFAULT_API_URL = 'http://46.224.121.242:3000';

function detectApiUrl() {
  const host = window.location.hostname;
  if (host.includes('replit.dev') || host.includes('replit.app') || host === 'localhost' || host === '127.0.0.1') {
    return window.location.origin;
  }
  return DEFAULT_API_URL;
}

function getApiUrl() {
  try {
    const stored = localStorage.getItem('eb_api_url');
    if (stored) return stored;
    return detectApiUrl();
  } catch { return DEFAULT_API_URL; }
}

async function apiFetch(path, options = {}) {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}/api${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const sid = localStorage.getItem('eb_session_id');
  if (sid) {
    headers['Authorization'] = `Bearer ${sid}`;
  }

  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

function createEntityProxy(entityName) {
  return {
    async create(body) {
      return apiFetch(`/entities/${entityName}`, { method: 'POST', body: JSON.stringify(body) });
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
    async update(id, body) {
      return apiFetch(`/entities/${entityName}/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    },
    async delete(id) {
      return apiFetch(`/entities/${entityName}/${id}`, { method: 'DELETE' });
    },
    subscribe(callback) {
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
      return apiFetch(`/functions/${functionName}`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  },

  auth: {
    async me() {
      try {
        const result = await apiFetch('/auth/user');
        return result?.user || null;
      } catch {
        return null;
      }
    },
    async logout() {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch {}
      try { localStorage.removeItem('eb_session_id'); } catch {}
      try { sessionStorage.removeItem('activeCharacter'); } catch {}
      window.location.reload();
    },
  },

  getApiUrl,
};

export default base44;
