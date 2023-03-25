import { Env } from "./types"

export function redactCf(cf: any) {
	// Don't need this junk and it takes room in logtail
	const remove = [
		"clientAcceptEncoding",
		"clientTcpRtt",
		"edgeRequestKeepAliveStatus",
		"httpProtocol",
		"requestPriority",
		"tlsCipher",
		"tlsClientAuth",
		"tlsExportedAuthenticator",
		"tlsVersion",
	]
	let newCf: any = {}
	Object.assign(newCf, cf)
	remove.forEach(key => delete newCf[key])
	return newCf
}

export function isProd(env: Env): boolean {
	return env.ENVIRONMENT === 'prod'
}