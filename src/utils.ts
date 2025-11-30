import { load as loadYaml } from 'js-yaml';

export interface Env {
	SECRET: string;
	ORG_CONFIG: string;
	REPO_CONFIG: string;
	HEADERS: string;
}

// utils.ts
export async function send_request(hook: SingleHook | string, payload: string, headers: Headers) {
  const url = typeof hook === 'string' ? hook : hook.url;
  const name = typeof hook === 'string' ? null : (hook.name || null);

  if (!url || typeof url !== 'string') {
    throw `Invalid webhook URL: ${url}`;
  }

  // 处理 hook 自己的 headers
  const hook_headers = typeof hook === 'object' ? (hook.headers || {}) : {};
  for (const [key, value] of Object.entries(hook_headers)) {
    if (value === null) {
      headers.delete(key);
    } else {
      headers.set(key, value);
    }
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,  // 直接传整个 headers，比手动展开更安全
    body: payload,
  });

  if (!response.ok) {
    throw `Status ${response.status} ${response.statusText}`;
  }

  return response.status;
}

export async function parse_config(text: string) {
	try {
		return loadYaml(text);
	} catch {
		return JSON.parse(text);
	}
}
