export const handler = async (...args: any[]) => {
  const [request] = args;
  const event = request.aws || {};

  console.log("event: ", event);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
    });
  }

  return new Response("Resource not found.", {
    status: 404,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
