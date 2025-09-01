export function createResponse(statusCode: number, body: any): Response {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export function logRequest(event: any, context: any) {
  console.log("Request:", {
    requestId: context.awsRequestId,
    path: event.path,
    method: event.httpMethod,
    timestamp: new Date().toISOString(),
  });
}

export function validateInput(data: any, requiredFields: string[]) {
  const missing = requiredFields.filter((field) => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}
