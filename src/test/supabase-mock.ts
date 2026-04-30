type QueryResult<T = unknown> = { data: T | null; error: { message: string; code?: string } | null };

export type ChainStep = {
  table: string;
  ops: Array<[string, unknown[]]>;
};

/**
 * Builds a chainable Supabase query mock. The builder is itself thenable: any
 * operation (`select`, `insert`, `update`, `delete`, `upsert`) sets a pending
 * result; subsequent filters return the same builder; `await` resolves to that
 * result. Terminal getters (`single`, `maybeSingle`) bypass it and return their
 * configured result directly.
 *
 * Usage:
 *   const { client } = makeSupabaseMock({
 *     auth: { user: { id: "u-1" } },
 *     from: {
 *       tickets: { update: { data: null, error: { message: "denied" } } },
 *       users: { single: { data: { company_id: "c-1" }, error: null } },
 *     },
 *   });
 */
export function makeSupabaseMock(opts: {
  auth?: {
    user?: { id: string; email?: string; app_metadata?: Record<string, unknown> } | null;
    error?: { message: string } | null;
    queue?: Record<string, QueryResult[]>;
  };
  from?: Record<
    string,
    Partial<{
      select: QueryResult;
      single: QueryResult;
      maybeSingle: QueryResult;
      insert: QueryResult;
      update: QueryResult;
      delete: QueryResult;
      upsert: QueryResult;
      result: QueryResult;
    }>
  >;
  storage?: {
    remove?: QueryResult;
    upload?: QueryResult;
  };
  rpc?: Record<string, QueryResult>;
} = {}) {
  const calls: ChainStep[] = [];

  function buildBuilder(table: string) {
    const ops: Array<[string, unknown[]]> = [];
    const tableConfig = opts.from?.[table] ?? {};
    let pendingResult: QueryResult = tableConfig.select ?? tableConfig.result ?? { data: [], error: null };

    const builder: Record<string, unknown> = {};

    // Filters & modifiers — return self
    [
      "eq", "neq", "gt", "gte", "lt", "lte",
      "ilike", "like", "in", "is", "match",
      "or", "filter", "order", "range", "limit",
    ].forEach((m) => {
      builder[m] = jest.fn((...args: unknown[]) => {
        ops.push([m, args]);
        return builder;
      });
    });

    builder.select = jest.fn((...args: unknown[]) => {
      ops.push(["select", args]);
      pendingResult = tableConfig.select ?? tableConfig.result ?? pendingResult;
      return builder;
    });

    builder.insert = jest.fn((...args: unknown[]) => {
      ops.push(["insert", args]);
      pendingResult = tableConfig.insert ?? { data: null, error: null };
      return builder;
    });
    builder.update = jest.fn((...args: unknown[]) => {
      ops.push(["update", args]);
      pendingResult = tableConfig.update ?? { data: null, error: null };
      return builder;
    });
    builder.delete = jest.fn((...args: unknown[]) => {
      ops.push(["delete", args]);
      pendingResult = tableConfig.delete ?? { data: null, error: null };
      return builder;
    });
    builder.upsert = jest.fn((...args: unknown[]) => {
      ops.push(["upsert", args]);
      pendingResult = tableConfig.upsert ?? { data: null, error: null };
      return builder;
    });

    // Terminal getters — return their own configured result
    builder.single = jest.fn(async () => {
      ops.push(["single", []]);
      return tableConfig.single ?? tableConfig.result ?? pendingResult;
    });
    builder.maybeSingle = jest.fn(async () => {
      ops.push(["maybeSingle", []]);
      return tableConfig.maybeSingle ?? tableConfig.result ?? pendingResult;
    });

    // Builder is thenable → resolves to pendingResult on `await`
    builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve(pendingResult).then(resolve);

    calls.push({ table, ops });
    return builder;
  }

  const client = {
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: opts.auth?.user ?? null },
        error: opts.auth?.error ?? null,
      })),
      signInWithPassword: jest.fn(async () => ({
        data: opts.auth?.user ? { user: opts.auth.user, session: {} } : null,
        error: opts.auth?.error ?? null,
      })),
      signOut: jest.fn(async () => ({ error: null })),
      updateUser: jest.fn(async () => ({
        data: { user: opts.auth?.user },
        error: opts.auth?.error ?? null,
      })),
      admin: {
        createUser: jest.fn(async () => {
          const queued = opts.auth?.queue?.["admin.createUser"]?.shift();
          if (queued) return queued;
          if (!opts.auth?.user) return { data: null, error: { message: "no user configured" } };
          return { data: { user: opts.auth.user }, error: null };
        }),
        deleteUser: jest.fn(async () => ({ data: null, error: null })),
        generateLink: jest.fn(async () => ({
          data: { properties: { action_link: "https://example.com/recover?token=abc" } },
          error: null,
        })),
      },
    },
    from: jest.fn((table: string) => buildBuilder(table)),
    storage: {
      from: jest.fn(() => ({
        remove: jest.fn(async () => opts.storage?.remove ?? { data: null, error: null }),
        upload: jest.fn(async () => opts.storage?.upload ?? { data: null, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: "https://example.com/file.png" } })),
      })),
    },
    rpc: jest.fn(async (name: string) => opts.rpc?.[name] ?? { data: null, error: null }),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  };

  return { client, calls };
}

export function buildFormData(values: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.append(k, v));
  return fd;
}
