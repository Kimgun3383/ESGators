const userBodySchema = {
  type: "object",
  required: ["email", "name"],
  additionalProperties: false,
  properties: {
    email: { type: "string", format: "email", minLength: 3, maxLength: 255 },
    name: { type: "string", minLength: 1, maxLength: 120 },
  },
};

const userIdParamSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", format: "uuid" },
  },
};

function ensureDb(app) {
  if (!app.hasDecorator("supabase")) {
    throw app.httpErrors.internalServerError(
      "Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file."
    );
  }
}

async function usersRoutes(app) {
  app.get("/", async () => {
    ensureDb(app);

    const { data, error } = await app.supabase
      .from("users")
      .select("id, email, name, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw app.httpErrors.internalServerError(error.message);
    }

    return { users: data };
  });

  app.get(
    "/:id",
    {
      schema: {
        params: userIdParamSchema,
      },
    },
    async (request) => {
      ensureDb(app);

      const { data, error } = await app.supabase
        .from("users")
        .select("id, email, name, created_at, updated_at")
        .eq("id", request.params.id)
        .maybeSingle();

      if (error) {
        throw app.httpErrors.internalServerError(error.message);
      }

      if (!data) {
        throw app.httpErrors.notFound("User not found");
      }

      return { user: data };
    }
  );

  app.post(
    "/",
    {
      schema: {
        body: userBodySchema,
      },
    },
    async (request, reply) => {
      ensureDb(app);

      const { email, name } = request.body;

      const { data, error } = await app.supabase
        .from("users")
        .insert({ email, name })
        .select("id, email, name, created_at, updated_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw app.httpErrors.conflict("A user with that email already exists");
        }

        throw app.httpErrors.internalServerError(error.message);
      }

      reply.code(201);
      return { user: data };
    }
  );

  app.put(
    "/:id",
    {
      schema: {
        params: userIdParamSchema,
        body: userBodySchema,
      },
    },
    async (request) => {
      ensureDb(app);

      const { id } = request.params;
      const { email, name } = request.body;

      const { data, error } = await app.supabase
        .from("users")
        .update({ email, name, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, email, name, created_at, updated_at")
        .maybeSingle();

      if (error) {
        if (error.code === "23505") {
          throw app.httpErrors.conflict("A user with that email already exists");
        }

        throw app.httpErrors.internalServerError(error.message);
      }

      if (!data) {
        throw app.httpErrors.notFound("User not found");
      }

      return { user: data };
    }
  );

  app.delete(
    "/:id",
    {
      schema: {
        params: userIdParamSchema,
      },
    },
    async (request, reply) => {
      ensureDb(app);

      const { data, error } = await app.supabase
        .from("users")
        .delete()
        .eq("id", request.params.id)
        .select("id")
        .maybeSingle();

      if (error) {
        throw app.httpErrors.internalServerError(error.message);
      }

      if (!data) {
        throw app.httpErrors.notFound("User not found");
      }

      reply.code(204);
      return null;
    }
  );
}

module.exports = usersRoutes;
