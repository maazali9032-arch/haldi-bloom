import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  errorHandler: "./src/nitro-error.ts",
});
