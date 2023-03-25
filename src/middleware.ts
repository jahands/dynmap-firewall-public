import * as constants from "./constants"
import { logtail } from "./logtail"
import { isProd, redactCf } from "./utils"

import { requestData, LogLevel, Env } from "./types"

/** Middleware: load auth into request based on asn allow list */
export async function checkAuth(
	request: Request & requestData, env: Env
): Promise<Response | void> {
	request.isAuthed = true
	if (isProd(env) && !constants.asnAllow.includes(request.cf?.asn || 0)) {
		request.isAuthed = false
	}
}

/** Middleware: Optionally redir to world depending on query params */
export async function maybeRedirToWorld(request: Request): Promise<Response | void> {
	const url = new URL(request.url)
	if (!url.toString().includes('?')) {
		return Response.redirect(url.origin + constants.defaultWorld, 302)
	}
}

/** Middleware: Redacts players outside of allowed ASNs
	* Assumes that the request is for /up/world/:world/:ts
	*/
export async function maybeRedactPlayers(request: Request & requestData): Promise<Response | void> {
	if (!request.isAuthed) {
		const res = await fetch(request)
		const data = await res.json() as { players: [], currentcount: number }
		data.players = []
		data.currentcount = 0
		return Response.json(data)
	}
}

/** Middleware: Log unauthed requests to Logtail (presumably they were still allowed) */
export async function logUnauthed(
	request: Request & requestData, env: Env, ctx: ExecutionContext
): Promise<Response | void> {
	if (!request.isAuthed) {
		const url = new URL(request.url)
		const prefix = `[${request.cf?.colo}][${(request.cf as any).timezone}]`
		const asMsg = `${request.cf?.asn} ${request.cf?.asOrganization}`
		const msg = `${prefix} Not blocking unauthed asn: ${asMsg} | ${url.pathname}`
		ctx.waitUntil(logtail({
			env, msg,
			level: LogLevel.Warn,
			data: {
				url: request.url,
				isAuthed: request.isAuthed,
				cf: redactCf(request.cf)
			}
		}))
	}
}

/** Middleware: Block unauthed if env.BLOCKASN === 'true' */
export async function maybeBlockUnauthed(
	request: Request & requestData, env: Env, ctx: ExecutionContext
): Promise<Response | void> {
	if (!request.isAuthed && env.BLOCKASN === 'true') {
		const url = new URL(request.url)
		const prefix = `[${request.cf?.colo}][${(request.cf as any).timezone}]`
		const asMsg = `${request.cf?.asn} ${request.cf?.asOrganization}`
		const msg = `${prefix} Blocking asn: ${asMsg} | ${url.pathname}`
		ctx.waitUntil(logtail({
			env, msg,
			level: LogLevel.Warn,
			data: {
				url: request.url,
				isAuthed: request.isAuthed,
				cf: redactCf(request.cf)
			}
		}))
		return new Response("Sorry, you might not be allowed to see this :(\n" +
			"Here's an apple for your trouble: 🍎",
			{ status: 401, statusText: 'forbidden' })
	}
}