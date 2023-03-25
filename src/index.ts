import { Router } from 'itty-router'
import { logtail } from './logtail'
import * as m from './middleware'
import { redactCf } from './utils'
import { Env, LogLevel, IRequest, IMethods, requestData } from "./types"
import * as constants from './constants'

const router = Router<IRequest, IMethods>()
	// Custom favicon (serve before any auth)
	.get('/favicon.ico', serveFavicon)
	.get('/images/dynmap.ico', serveFavicon)

	// Check auth below this, and possibly block/redact depending on env.BLOCKASN
	.all('*', m.checkAuth, m.maybeBlockUnauthed)
	.get('/', m.logUnauthed, m.maybeRedirToWorld)
	.get('/up/world/:world/:ts', m.maybeRedactPlayers)

	// Custom caching for tiles
	.get('/tiles/faces/*', passthroughWithTtl(3600)) // 1 hour
	.get('/tiles/*', passthroughWithTtl(30))

	// Catch-all routes
	.get('*', passthrough)
	.all('*', () => new Response('forbidden', { status: 401 }))

export default {
	async fetch(
		request: Request & requestData, env: Env, ctx: ExecutionContext
	): Promise<Response> {
		let response: Response
		try {
			response = await router.handle(request as IRequest, env, ctx)
		} catch (e: any) {
			// Catch all errors and send to logtail.com
			const msg = e.message
			ctx.waitUntil(logtail({
				env, msg,
				level: LogLevel.Error,
				data: {
					url: request.url,
					error: {
						message: e.message,
						isAuthed: request.isAuthed,
						stack: e.stack
					},
					cf: redactCf(request.cf)
				}
			}))
			return new Response("Something went wrong", { status: 500 })
		}
		return response
	}
};

/** pass request to origin */
async function passthrough(
	request: Request
): Promise<Response> {
	return fetch(request)
}

/** generates a function that fetches with a custom cacheTtl */
function passthroughWithTtl(ttl: number): (request: Request) => Promise<Response> {
	return (request: Request) =>
		fetch(request, { cf: { cacheTtl: ttl } })
}

/** Serves the favicon */
export async function serveFavicon(request: Request): Promise<Response | void> {
	const url = new URL(request.url)
	url.pathname = constants.newFavicon
	return fetch(url.toString(),
		{ cf: { cacheEverything: true, cacheTtl: 604800 } })
}