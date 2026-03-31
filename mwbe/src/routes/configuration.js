/**
 * Radio network configuration endpoints.
 *
 * Last Edit: Nicholas Sardinia, 3/29/2026
 */

const nodeIdentifierSchema = {
  anyOf: [
    { type: "string", minLength: 1, maxLength: 255 },
    { type: "integer" },
  ],
};

const radioNetworkNodeSchema = {
  type: "object",
  required: ["nodeId", "role", "preferredGateway", "fallbackGateway", "enabled"],
  additionalProperties: false,
  properties: {
    nodeId: nodeIdentifierSchema,
    role: { type: "string", enum: ["client", "gateway"] },
    preferredGateway: nodeIdentifierSchema,
    fallbackGateway: {
      anyOf: [nodeIdentifierSchema, { type: "integer", enum: [0] }],
    },
    enabled: { type: "boolean" },
  },
};

const radioNetworkConfigSchema = {
  type: "object",
  required: ["version", "gateways", "nodes"],
  additionalProperties: false,
  properties: {
    version: { type: "integer", enum: [1] },
    gateways: {
      type: "array",
      items: nodeIdentifierSchema,
    },
    nodes: {
      type: "array",
      items: radioNetworkNodeSchema,
    },
  },
};

const persistedConfigSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    path: { type: "string" },
    config: radioNetworkConfigSchema,
  },
};

const errorSchema = {
  type: "object",
  properties: {
    statusCode: { type: "integer" },
    error: { type: "string" },
    message: { type: "string" },
  },
};

function ensureFirebaseDb(app) {
  if (!app.hasDecorator("firebaseDb")) {
    throw app.httpErrors.internalServerError(
      "Firebase Realtime Database is not configured. Set FIREBASE_DATABASE_URL and Firebase credentials."
    );
  }
}

async function configurationRoutes(app) {
  app.post(
    "/radio-network",
    {
      schema: {
        tags: ["Configuration"],
        summary: "Persist radio network configuration to Firebase Realtime Database",
        body: radioNetworkConfigSchema,
        response: {
          200: persistedConfigSchema,
          500: errorSchema,
        },
      },
    },
    async (request) => {
      ensureFirebaseDb(app);

      const configPath = "config/radio-network";
      await app.firebaseDb.ref(configPath).set(request.body);

      return {
        message: "Radio network configuration saved to Firebase Realtime Database",
        path: configPath,
        config: request.body,
      };
    }
  );
}

module.exports = configurationRoutes;
