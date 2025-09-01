import { logRequest, createResponse } from "/opt/shared/utils";
import { Context } from "aws-lambda";

export const handler = async (event: any, context: Context) => {
  // Use shared utility for logging
  logRequest(event, context);

  console.log("Hello from Bun Lambda with shared dependencies!");

  // Use shared utility for response
  return createResponse(200, {
    message: "Hello from Bun Lambda with shared dependencies!",
    timestamp: new Date().toISOString(),
    requestId: context.awsRequestId,
  });
};
