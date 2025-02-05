/*
------------------------------------------------------------------------
DESCRIPTION

Base controller class for streamlined status responses with automatic error handling
------------------------------------------------------------------------
*/

import { Controller } from "tsoa";
import { AlreadyExistsError } from "../core/errors/AlreadyExistsError";

export class BaseController extends Controller {
	public Ok<T>(data: T): T {
		this.setStatus(200); // OK
		return data;
	}

	public Bad<T>(data: T): T {
		this.setStatus(400); // Bad Request
		return data;
	}

	public Unauthorized<T>(data: T): T {
		this.setStatus(401); // Unauthorized
		return data;
	}

	public Forbidden<T>(data: T): T {
		this.setStatus(403); // Forbidden
		return data;
	}

	public NotFound<T>(data: T): T {
		this.setStatus(404); // Not Found
		return data;
	}

	public InternalServerError<T>(data: T): T {
		this.setStatus(500); // Internal Server Error
		return data;
	}

	public AlreadyExists<T>(data: T): T {
		this.setStatus(409); // Conflict (Already Exists)
		return data;
	}

	/**
	 * Handles exceptions and returns an appropriate response
	 * @param ex - The caught exception
	 */
	public handleException<T>(ex: any): T | string {
		if (ex instanceof AlreadyExistsError) {
			return this.AlreadyExists(ex.message);
		}
		// Default to internal server error for unexpected exceptions
		return this.InternalServerError("An unexpected error occurred.");
	}
}
