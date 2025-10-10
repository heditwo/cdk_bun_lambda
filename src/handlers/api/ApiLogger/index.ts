export const handler = async (request: Request & { aws?: any }) => {
  console.log("=== FULL ARGUMENTS ===");
  console.log([request]);

  console.log("=== REQUEST OBJECT ===");
  console.log(request);

  console.log("=== HEADERS ===");
  if (request.headers) {
    const headers: Record<string, string> = {};
    request.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });
    console.log(headers);
  }

  console.log("=== AWS EVENT ===");
  const event = request.aws || {};
  console.log(event);

  console.log("=== BODY ===");
  try {
    const body = await request.json();
    console.log(body);
  } catch (error) {
    console.log("Error parsing JSON body:", error);
  }

  return new Response(
    JSON.stringify({
      message: "Event logged successfully",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
