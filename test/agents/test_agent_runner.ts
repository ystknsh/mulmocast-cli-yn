import mulmoPromptsAgent from "../../src/agents/mulmo_prompts_agent.js";
import { agentTestRunner } from "@receptron/test_utils/lib/agent_test_runner.js";

const main = async () => {
  await agentTestRunner(mulmoPromptsAgent);
};

main();
