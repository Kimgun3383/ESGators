const rootRoutes = require("./root");
const usersRoutes = require("./users");

function registerRoutes(app) {
  app.register(rootRoutes, { prefix: "/" });
  app.register(usersRoutes, { prefix: "/users" });
}

module.exports = registerRoutes;
