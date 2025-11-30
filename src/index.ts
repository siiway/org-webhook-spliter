import { Env, send_request, parse_config } from './utils';

async function send_webhook(data: string, headers: Headers, owner: string, full_name: string, private_repo: boolean | null, env: Env) {
	// get repo config
	console.debug(`Try match repo ${full_name}`);
	const repoConfigs: RepoConfig = await parse_config(env.REPO_CONFIG);
	var targets = repoConfigs[full_name] || null;
	if (targets !== null) {
		console.info(`Matched ${targets.length} targets for ${full_name} repo`);
	} else {
		// get org config
		console.debug(`Try match org ${owner}`);
		const orgConfigs: OrgConfig = await parse_config(env.ORG_CONFIG);
		const orgConfig = orgConfigs[owner];
		if (!orgConfig) {
			console.error(`No config for organization ${owner}`);
			throw `No config for organization ${owner}`;
		}

		if (private_repo === true) {
			targets = orgConfig.private || [];
			console.info(`Matched ${targets.length} targets for private repos for ${owner} org`);
		} else if (private_repo === false) {
			targets = orgConfig.public || [];
			console.info(`Matched ${targets.length} targets for public repos for ${owner} org`);
		} else {
			targets = orgConfig.others || [];
			console.info(`Matched ${targets.length} targets for other events for ${owner} org`);
		}
	}

	var errors = [];
	for (const hook of targets) {
		try {
			var status = await send_request(hook, data, headers);
			console.info(`Sent webhook to ${hook.name || hook.url}: ${status}`);
		} catch (e) {
			console.error(`Error sending webhook to ${hook.name || hook.url}: ${e}`);
			errors.push(`${hook.name || hook.url}: ${e}`);
		}
	}

	if (errors.length !== 0) {
		console.warn(`Total ${errors.length} webhook(s) failed!`);
		throw `${errors.length} webhook(s) failed:\n- ${errors.join('\n- ')}`;
	}
}

export default {
	async fetch(request, env: Env, ctx): Promise<Response> {
		// get request info
		const srcip = request.headers.get('CF-Connecting-IP');
		const path = new URL(request.url).pathname;
		console.info(`New request from ${srcip}, path: ${path}`);
		if (path === '/') {
			console.info(`Redirected to homepage`);
			return new Response('', { status: 301, headers: { Location: 'https://github.com/siiway/org-webhook-spliter' } });
		}

		// check method
		if (request.method !== 'POST') {
			console.warn(`Wrong method: ${request.method}, return 405`);
			return new Response('Method not allowed', { status: 405 });
		}

		// check secret
		const secret = env.SECRET.startsWith('/') ? env.SECRET : '/' + env.SECRET;
		if (path !== secret && secret !== '/disabled') {
			return new Response('Wrong Secret!', { status: 401 });
		}

		// parse hook
		const body = await request.text();
		const json = JSON.parse(body);
		const owner: string = json.organization?.login;
		console.info(`Owner: ${owner}`);
		const full_name = json.repository?.full_name;
		const private_repo: boolean | null = json.repository?.private;
		console.info(`Private repo: ${private_repo}`);

		// try forward webhook
		try {
			const forwardHeaders = new Headers({
				'User-Agent': 'org-webhook-spliter (+https://github.com/siiway/org-webhook-spliter)',
				Accept: '*/*',
				'X-GitHub-Delivery': request.headers.get('X-GitHub-Delivery') || 'unknown',
				'X-GitHub-Event': request.headers.get('X-GitHub-Event') || 'unknown',
				'X-GitHub-Hook-ID': request.headers.get('X-GitHub-Hook-ID') || 'unknown',
				'X-GitHub-Hook-Installation-Target-ID': request.headers.get('X-GitHub-Hook-Installation-Target-ID') || 'unknown',
				'X-GitHub-Hook-Installation-Target-Type': request.headers.get('X-GitHub-Hook-Installation-Target-Typet') || 'unknown',
			});
			const cfg_headers: Headers = await parse_config(env.HEADERS);
			for (const [key, value] of Object.entries(cfg_headers)) {
				if (value === null) {
					forwardHeaders.delete(key);
				} else {
					forwardHeaders.set(key, value);
				}
			}

			await send_webhook(body, forwardHeaders, owner, full_name, private_repo, env);
		} catch (e) {
			console.error(`Failed: ${e}`);
			return new Response(`Failed: ${e}`, { status: 500 });
		}

		console.info(`Success!`);
		return new Response(null, { status: 204 });
	},
} satisfies ExportedHandler<Env>;
