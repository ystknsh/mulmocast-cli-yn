import { GraphAILogger } from "graphai";

export const setGraphAILogger = (verbose: boolean | undefined, logValues?: Record<string, unknown>) => {
  if (verbose) {
    if (logValues) {
      Object.entries(logValues).forEach(([key, value]) => {
        GraphAILogger.info(`${key}:`, value);
      });
    }
  } else {
    GraphAILogger.setLevelEnabled("error", false);
    GraphAILogger.setLevelEnabled("log", false);
    GraphAILogger.setLevelEnabled("warn", false);
  }
};
