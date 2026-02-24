const cors = require("@fastify/cors");
const helmet = require("@fastify/helmet");
const sensible = require("@fastify/sensible");
const registerSupabase = require("./supabase");

function registerPlugins(app) {
  app.register(sensible);
  app.register(helmet);
  app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
  });
  registerSupabase(app);
}

module.exports = registerPlugins;
