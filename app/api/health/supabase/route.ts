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

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const table = process.env.SUPABASE_QUIZ_SESSIONS_TABLE?.trim() || "quiz_sessions";

  let status: number | null = null;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
      endpoint.searchParams.set("select", "*");
      endpoint.searchParams.set("limit", "1");

      const response = await fetch(endpoint.toString(), {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        cache: "no-store",
      });
      status = response.status;
    } catch {
      status = 0;
    }
  }

  return Response.json({
    app: "biomed-quiz-arena",
    environment: process.env.VERCEL_ENV ?? "local",
    env: {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasServiceRoleKey: Boolean(serviceRoleKey),
      serviceRoleKeyLooksLikeJwt: serviceRoleKey
        ? serviceRoleKey.split(".").length === 3
        : false,
      serviceRoleKeyRole: getJwtRole(serviceRoleKey),
      table,
    },
    supabase: {
      checked: Boolean(supabaseUrl && serviceRoleKey),
      status,
      result: sanitizeStatus(status),
    },
  });
}
