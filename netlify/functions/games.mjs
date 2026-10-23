export default async (request) => {
  const apiKey = Netlify.env.get("RAWG_API_KEY");

  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get("search");

  const apiUrl = new URL("https://api.rawg.io/api/games");
  apiUrl.searchParams.set("key", apiKey);

  if (search) {
    apiUrl.searchParams.set("search", search);
  }

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return Response.json({ error: "RAWG request failed" }, { status: 502 });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Unable to fetch games" }, { status: 500 });
  }
};
