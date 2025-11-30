import { load as loadYaml } from 'js-yaml';

export interface Env {
	SECRET: string;
	ORG_CONFIG: string;
	REPO_CONFIG: string;
	HEADERS: string;
}

export async function send_request(hook: SingleHook, payload: string, headers: Headers) {
	try {
		// get hook's headers & append/replace them
		let hook_headers = hook.headers || {};
		for (const [key, value] of Object.entries(hook_headers)) {
			if (value === null) {
				// null -> delete
				headers.delete(key);
			} else {
				headers.set(key, value);
			}
		}
		if (!headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json');
		}

		const response = await fetch(hook.url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: payload,
		});
		if (!response.ok) {
			throw `Status is not 2xx: ${response.status}`;
		}
		return response.status;
	} catch (error) {
		throw `Error sending request: ${error}`;
	}
}

export async function parse_config(text: string) {
	try {
		return loadYaml(text);
	} catch {
		return JSON.parse(text);
	}
}
