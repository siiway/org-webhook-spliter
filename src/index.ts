interface Env {
	SECRET: string
	ORG_CONFIG: string
}
async function send_request(url: string, payload: string, headers: Headers) {
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
			throw `Status is not 2xx: ${response.status}`
		}
		return response.status
	} catch (error) {
		throw `Error sending request: ${error}`
	}
}

async function send_webhook(data: string, headers: Headers, sender: string, private_repo: boolean | null, env: Env) {
	const orgConfigs: OrgConfig = JSON.parse(env.ORG_CONFIG)
	const orgConfig = orgConfigs[sender];
	if (!orgConfig) {
		console.error(`No config for organization ${sender}`)
		throw `No config for organization ${sender}`
	}

	var targets = [];
	if (private_repo === true) {
		targets = orgConfig.private
		console.info(`Matched ${targets.length} targets for private repos for ${sender} org`)
	} else if (private_repo === false) {
		targets = orgConfig.public
		console.info(`Matched ${targets.length} targets for public repos for ${sender} org`)
	} else {
		targets = orgConfig.unknown
		console.info(`Matched ${targets.length} targets for unknown events for ${sender} org`)
	}

	var errors = []
	for (const url of targets) {
		try {
			var status = await send_request(url, data, headers)
			console.info(`Sent webhook to ${url}: ${status}`)
		} catch (e) {
			console.error(`Error sending webhook to ${url}: ${e}`)
			errors.push(`${url}: ${e}`)
		}
	}

	if (errors.length !== 0) {
		console.warn(`Total ${errors.length} webhook(s) failed!`)
		throw `${errors.length} webhook(s) failed:\n- ${errors.join('\n- ')}`
	}
}

export default {
	async fetch(request, env: Env, ctx): Promise<Response> {
		// get request info
		const srcip = request.headers.get('CF-Connecting-IP')
		const path = new URL(request.url).pathname
		console.info(`New request from ${srcip}, path: ${path}`)
		if (path === '/') {
			console.info(`Redirected to homepage`)
			return new Response('', { status: 301, headers: { 'Location': 'https://github.com/siiway/org-webhook-spliter' } })
		}

		// check method
		if (request.method !== 'POST') {
			console.warn(`Wrong method: ${request.method}, return 405`)
			return new Response('Method not allowed', { status: 405 })
		}

		// check secret
		// TODO

		// parse hook
		const body = await request.text()
		const json = JSON.parse(body)
		const sender: string = json.organization?.login
		console.info(`Sender: ${sender}`)
		var private_repo = json.repository?.private
		console.info(`Private repo: ${private_repo}`)

		// try forward webhook
		try {
			await send_webhook(body, request.headers, sender, private_repo, env)
		} catch (e) {
			console.error(`Failed: ${e}`)
			return new Response(`Failed: ${e}`, { status: 500 })
		}

		console.info(`Success!`)
		return new Response(null, { status: 204 })
	},
} satisfies ExportedHandler<Env>
