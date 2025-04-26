import mulmoPromptsAgent from "../../src/agents/mulmo_prompts_agent";
import { agentTestRunner } from "@receptron/test_utils/lib/agent_test_runner";

const main = async () => {
  await agentTestRunner(mulmoPromptsAgent);
};

main();
