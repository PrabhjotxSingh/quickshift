"use strict";
import { app } from "./app";
import serverless from "serverless-http";

export const quickshift = serverless(app);
