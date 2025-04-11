import { logger } from "./logger";

export interface ParsedMessage<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function parseMessage<T>(
  payload: string,
  messageType: string
): ParsedMessage<T> {
  try {
    let data: any;

    switch (messageType) {
      case "battery":
        const batteryLevel = Number(payload);
        if (isNaN(batteryLevel) || batteryLevel < 0 || batteryLevel > 100) {
          return {
            success: false,
            error: "Invalid battery level. Must be between 0 and 100",
          };
        }
        data = batteryLevel;
        break;

      case "status":
        if (!["idle", "busy", "offline", "error"].includes(payload)) {
          return {
            success: false,
            error: "Invalid status. Must be one of: idle, busy, offline, error",
          };
        }
        data = payload;
        break;

      default:
        // Try to parse as JSON for other message types
        try {
          data = JSON.parse(payload);
        } catch {
          data = payload; // Use raw payload if not JSON
        }
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    logger.error(`Error parsing message of type ${messageType}:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error parsing message",
    };
  }
}
