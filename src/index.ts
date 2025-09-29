import { Webhooks } from '@octokit/webhooks'
interface Env {
	SECRET: string
	CONFIG: Config
}

// const config = {
// 	'siiway': {
// 		'public': [''],
// 		'private': [''],
// 		'unknown': ['']
// 	}
// }

async function send_request(url: string, payload: string, headers: Headers): Promise<void> {
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
	} catch (error) {
		throw `Error forwarding to ${url}: ${error}`
	}
}

async function send_webhook(data: string, headers: Headers, sender: string, private_repo: boolean | null, env: Env) {
	const orgConfig = env.CONFIG[sender];
	if (!orgConfig) {
		return new Response(`No config for organization ${sender}`, { status: 400 });
	}

	var targets = [];
	if (private_repo === true) {
		targets = orgConfig.private
	} else if (private_repo === false) {
		targets = orgConfig.public
	} else {
		targets = orgConfig.unknown
	}

	for (const url of targets) {
		send_request(url, data, headers)
	}
}

export default {
	async fetch(request, env: Env, ctx): Promise<Response> {
		// get url
		const url = new URL(request.url).pathname
		console.log(`Request: ${url}`)
		if (url === '/') {
			return new Response('', { status: 301, headers: { 'Location': 'https://github.com/siiway/org-webhook-spliter' } })
		}

		// check method
		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 })
		}

		// get hook info
		const signature = request.headers.get('X-Hub-Signature-256') || 'None'
		const body = await request.text()
		const secret = env.SECRET
		const webhook = new Webhooks({ secret });

		// verify hook signature
		if (!webhook.verify(body, signature)) {
			return new Response('Signature verify failed!', { status: 401 })
		}

		// parse hook
		const json = JSON.parse(body)
		const sender: string = json.organization?.login
		var private_repo = json.repository?.private

		// try forward webhook
		try {
			await send_webhook(body, request.headers, sender, private_repo, env)
		} catch (e) {
			return new Response(`Failed: ${e}`, { status: 500 })
		}

		return new Response('Forward success!', { status: 204 })
	},
} satisfies ExportedHandler<Env>
