/**
 * Cloudflare Workers entry — Express via Node HTTP compatibility.
 * @see https://developers.cloudflare.com/workers/tutorials/deploy-an-express-app/
 */

import { httpServerHandler } from "cloudflare:node";
import app from "./app-worker.js";

const PORT = 3000;
app.listen(PORT);

export default httpServerHandler({ port: PORT });
