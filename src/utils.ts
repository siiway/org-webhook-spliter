import { load as loadYaml } from 'js-yaml';

export interface Env {
	SECRET: string;
	ORG_CONFIG: string;
	REPO_CONFIG: string;
    HEADERS: string;
}

export async function send_request(url: string, payload: string, headers: Headers) {
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-GitHub-Event': headers.get('X-GitHub-Event') || '',
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
