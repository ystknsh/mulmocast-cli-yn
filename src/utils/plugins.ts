import { TransactionLog } from "graphai";

// workaround for ora which is a pure ESM package
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let spinner: any = { start: () => {}, stop: () => {}, prefixText: "" };
const initSpinner = async () => {
  const ora = await import("ora");
  spinner = ora.default();
  spinner.prefixText = "\n";
};

initSpinner().catch(console.error);

export const cliLoadingPlugin =
  ({ nodeId, message }: { nodeId: string; message: string }) =>
  (log: TransactionLog) => {
    if (log.nodeId === nodeId && log.state === "queued") {
      spinner.start(message);
    }
    if (log.nodeId === nodeId && log.state === "completed") {
      spinner.stop();
    }
  };
