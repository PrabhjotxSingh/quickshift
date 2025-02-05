/*
------------------------------------------------------------------------
DESCRIPTION

Base controller class for streamlined status responses
------------------------------------------------------------------------
*/

import { Controller } from "tsoa";

export class baseController extends Controller {
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
}
