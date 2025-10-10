import { logRequest, createResponse } from "/opt/shared/utils";

export const handler = async (request: Request & { aws?: any }) => {
  const requestId = request.headers.get("x-amzn-requestid");
  const functionArn = request.headers.get("x-amzn-function-arn");
  const traceId = request.headers.get("x-amzn-trace-id");

  const event = request.aws || {};

  console.log("=== LAMBDA CONTEXT INFO ===");
  console.log({
    requestId,
    functionArn,
    traceId,
  });

  console.log("=== EVENT DATA ===");
  console.log(event);

  return createResponse(200, {
    message: "Hello from Bun Lambda!",
    requestId,
    receivedData: event,
    timestamp: new Date().toISOString(),
  });
};
