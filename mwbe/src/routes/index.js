const rootRoutes = require("./root");
const usersRoutes = require("./users");
const iotRoutes = require("./iot");

function registerRoutes(app) {
  app.register(rootRoutes, { prefix: "/" });
  app.register(usersRoutes, { prefix: "/users" });
  app.register(iotRoutes, { prefix: "/iot" });
}

module.exports = registerRoutes;
