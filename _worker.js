const DEFAULT_MAILBOT_ORIGIN = "https://mailbot-xl.sb1397.workers.dev";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function getMailbotOrigin(env) {
  return String(env.MAILBOT_ORIGIN || DEFAULT_MAILBOT_ORIGIN)
    .trim()
    .replace(/\/+$/, "");
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe" || url.pathname === "/api/health") {
      const mailbotOrigin = getMailbotOrigin(env);

      const upstreamUrl = new URL(url.pathname + url.search, `${mailbotOrigin}/`);
      const upstreamRequest = new Request(upstreamUrl.toString(), request);

      try {
        return await fetch(upstreamRequest);
      } catch (error) {
        return json(
          {
            ok: false,
            message: "Mailbot proxy request failed.",
            error: error instanceof Error ? error.message : String(error),
          },
          502,
        );
      }
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
