class BaseAgent:
    agent_name = "base_agent"

    def run(self, payload: dict) -> dict:
        raise NotImplementedError

