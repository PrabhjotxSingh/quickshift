import { AsyncLocalStorage } from "async_hooks";
import { Request } from "express";

const asyncLocalStorage = new AsyncLocalStorage<{ request: Request }>();

export function requestMiddleware(req: Request, res: any, next: any) {
	asyncLocalStorage.run({ request: req }, () => next());
}

export function getCurrentRequest(): Request | undefined {
	return asyncLocalStorage.getStore()?.request;
}
