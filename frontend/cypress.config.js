import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl:                "http://localhost:5173",
    viewportWidth:          1280,
    viewportHeight:         720,
    video:                  true,
    videoCompression:       32,
    screenshotOnRunFailure: true,
    defaultCommandTimeout:  10000,
    pageLoadTimeout:        30000,
    setupNodeEvents(on, config) {},
  },
});