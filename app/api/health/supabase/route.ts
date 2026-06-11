function cleanEnvValue(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const withoutBearer = trimmed.replace(/^Bearer\s+/i, "").trim();
  const first = withoutBearer.at(0);
  const last = withoutBearer.at(-1);

  if (
    withoutBearer.length >= 2 &&
    ((first === '"' && last === '"') ||
      (first === "'" && last === "'") ||
      (first === "`" && last === "`"))
  ) {
    return withoutBearer.slice(1, -1).trim();
  }

  return withoutBearer;
}

function getKeyFormat(token: string | undefined): "jwt" | "supabase_secret" | "other" | null {
  if (!token) {
    return null;
  }
  if (token.startsWith("sb_secret_")) {
    return "supabase_secret";
  }
  return token.split(".").length === 3 ? "jwt" : "other";
}

function getJwtRole(token: string | undefined): string | null {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      role?: string;
    };
    return typeof decoded.role === "string" ? decoded.role : null;
  } catch {
    return null;
  }
}

function sanitizeStatus(status: number | null) {
  if (status === 200 || status === 206) {
    return "ok";
  }
  if (status === 401 || status === 403) {
    return "auth_error";
  }
  if (status === 404) {
    return "table_or_endpoint_not_found";
  }
  if (status === null) {
    return "not_checked";
  }
  return "request_failed";
}

async function checkSupabase(
  endpoint: URL,
  serviceRoleKey: string,
  headers: Record<string, string>,
) {
  try {
    const response = await fetch(endpoint.toString(), {
      headers,
      cache: "no-store",
    });
    return response.status;
  } catch {
    return 0;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const rawServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL);
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const table = cleanEnvValue(process.env.SUPABASE_QUIZ_SESSIONS_TABLE) || "quiz_sessions";
  const keyFormat = getKeyFormat(serviceRoleKey);

  let status: number | null = null;
  const variants: Record<string, number | null> = {
    apikeyOnly: null,
    bearerSameKey: null,
    authorizationSameKey: null,
  };

  if (supabaseUrl && serviceRoleKey) {
    const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
    endpoint.searchParams.set("select", "*");
    endpoint.searchParams.set("limit", "1");

    variants.apikeyOnly = await checkSupabase(endpoint, serviceRoleKey, {
      apikey: serviceRoleKey,
    });
    variants.bearerSameKey = await checkSupabase(endpoint, serviceRoleKey, {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    });
    variants.authorizationSameKey = await checkSupabase(endpoint, serviceRoleKey, {
      apikey: serviceRoleKey,
      Authorization: serviceRoleKey,
    });
    status =
      variants.apikeyOnly === 200 || variants.apikeyOnly === 206
        ? variants.apikeyOnly
        : variants.bearerSameKey === 200 || variants.bearerSameKey === 206
          ? variants.bearerSameKey
          : variants.authorizationSameKey;
  }

  return Response.json({
    app: "biomed-quiz-arena",
    environment: process.env.VERCEL_ENV ?? "local",
    env: {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
      serviceRoleKeyNormalized: Boolean(
        rawServiceRoleKey && serviceRoleKey && rawServiceRoleKey !== serviceRoleKey,
      ),
      serviceRoleKeyFormat: keyFormat,
      serviceRoleKeyLooksLikeJwt: keyFormat === "jwt",
      serviceRoleKeyRole: getJwtRole(serviceRoleKey),
      table,
    },
    supabase: {
      checked: Boolean(supabaseUrl && serviceRoleKey),
      status,
      result: sanitizeStatus(status),
      variants: Object.fromEntries(
        Object.entries(variants).map(([name, variantStatus]) => [
          name,
          {
            status: variantStatus,
            result: sanitizeStatus(variantStatus),
          },
        ]),
      ),
    },
  });
}
