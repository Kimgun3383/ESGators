const Fastify = require("fastify");
const registerPlugins = require("./plugins");
const registerRoutes = require("./routes");

function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
    },
  });

  registerPlugins(app);
  registerRoutes(app);

  return app;
}

module.exports = buildApp;
