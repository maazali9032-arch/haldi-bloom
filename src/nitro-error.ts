import { defineErrorHandler } from "nitro";
import { notFoundResponse } from "./lib/not-found-response";

// Nitro validates paths before TanStack runs; malformed escapes need the same
// not-found behavior at this outer boundary as in the invitation route.
export default defineErrorHandler((_error, event) => {
  try {
    decodeURIComponent(new URL(event.req.url).pathname);
  } catch {
    return notFoundResponse();
  }
  return undefined;
});
