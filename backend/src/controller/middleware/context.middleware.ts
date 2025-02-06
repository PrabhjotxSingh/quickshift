import { AsyncLocalStorage } from "async_hooks";
import { Request, Response } from "express";

interface IRequestContext {
	req: Request;
	res: Response;
}

const asyncLocalStorage = new AsyncLocalStorage<IRequestContext>();

export function contextMiddleware(req: Request, res: Response, next: () => void) {
	asyncLocalStorage.run({ req, res }, () => next());
}

export function getRequestContext(): Request | undefined {
	return asyncLocalStorage.getStore()?.req;
}

export function getResponseContext(): Response | undefined {
	return asyncLocalStorage.getStore()?.res;
}
