import { Webhooks } from '@octokit/webhooks'
import { Env } from './utils'



export default {
	async fetch(request, env: Env, ctx): Promise<Response> {
		const url = new URL(request.url).pathname
		console.log(`Request: ${url}`)
		if (url === '/') {
			return new Response('', { status: 301, headers: { 'Location': 'about:blank' } })
		}

		if (request.method !== 'POST') {
			return new Response('Method not allowed', { status: 405 })
		}

		const signature = request.headers.get('X-Hub-Signature-256') || 'None'
		const body = await request.text()
		const secret = env.SECRET
		const webhook = new Webhooks({
			secret
		});

		if (!webhook.verify(body, signature)) {
			return new Response('Signature verify failed!', { status: 401 })
		}
		return new Response('Hello World!')
	},
} satisfies ExportedHandler<Env>
