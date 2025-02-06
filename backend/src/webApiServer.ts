/*
 * Runs app.ts as a web api for dev/debugging
 *
 * real app runs off of serverless.ts for free/cheaper deployment
 */
import { app } from "./app";

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
