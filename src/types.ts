import { Route, Request } from 'itty-router'

export interface Env {
    ENVIRONMENT: string
    // Ingress key for logtail.com
    LOGTAIL_KEY: string
    /** Fully block ASNs not in the allowlist (as apposed to redacting players) **/
    BLOCKASN: string
}

export enum LogLevel {
    Debug = "debug",
    Info = "info",
    Warn = "warn",
    Error = "error"
}

// itty-router types
export interface requestData {
    isAuthed?: boolean
}

type MethodType =
    'GET' |
    'HEAD' |
    'POST' |
    'PUT' |
    'DELETE' |
    'PATCH' |
    'OPTIONS' |
    'TRACE' |
    'CONNECT'

export interface IRequest extends Request {
    method: MethodType // method is required to be on the interface
    url: string // url is required to be on the interface
    optional?: string
}

export interface IMethods {
    get: Route
    head: Route
    post: Route
    put: Route
    delete: Route
    patch: Route
    options: Route
    trace: Route
    connect: Route
}
