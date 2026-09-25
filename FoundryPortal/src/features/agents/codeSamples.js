// Code shown on the Agents page.
// Snippets marked "Microsoft sample" are taken from the Agent Framework / Foundry docs.
// Snippets marked "reference pattern" are assembled for this portal and are not official samples.

// ---------------------------------------------------------------------------
// Build path: Agent Framework get-started steps (Python)
// ---------------------------------------------------------------------------

export const STEP1_INSTALL = String.raw`pip install agent-framework azure-identity`;

export const STEP1_FIRST_AGENT = String.raw`import asyncio

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from azure.identity import AzureCliCredential


async def main() -> None:
    client = FoundryChatClient(
        project_endpoint="https://your-project.services.ai.azure.com",
        model="gpt-4o",
        credential=AzureCliCredential(),
    )

    agent = Agent(
        client=client,
        name="HelloAgent",
        instructions="You are a friendly assistant. Keep your answers brief.",
    )

    # Non-streaming: get the complete response at once
    result = await agent.run("What is the capital of France?")
    print(f"Agent: {result}")

    # Streaming: receive tokens as they are generated
    print("Agent (streaming): ", end="", flush=True)
    async for chunk in agent.run("Tell me a one-sentence fun fact.", stream=True):
        if chunk.text:
            print(chunk.text, end="", flush=True)
    print()


if __name__ == "__main__":
    asyncio.run(main())`;

export const STEP2_TOOLS = String.raw`from random import randint
from typing import Annotated

from agent_framework import Agent, tool
from pydantic import Field


# NOTE: approval_mode="never_require" is for sample brevity.
# Use "always_require" in production for user confirmation before tool execution.
@tool(approval_mode="never_require")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    conditions = ["sunny", "cloudy", "rainy", "stormy"]
    return f"The weather in {location} is {conditions[randint(0, 3)]} with a high of {randint(10, 30)}°C."


agent = Agent(
    client=client,
    name="WeatherAgent",
    instructions="You are a helpful weather agent. Use the get_weather tool to answer questions.",
    tools=[get_weather],
)`;

export const STEP3_MULTI_TURN = String.raw`agent = Agent(
    client=client,
    name="ConversationAgent",
    instructions="You are a friendly assistant. Keep your answers brief.",
)

# Create a session to maintain conversation history
session = agent.create_session()

# First turn
result = await agent.run("My name is Alice and I love hiking.", session=session)
print(f"Agent: {result}\n")

# Second turn — the agent should remember the user's name and hobby
result = await agent.run("What do you remember about me?", session=session)
print(f"Agent: {result}")`;

export const STEP4_PROVIDER = String.raw`from typing import Any

from agent_framework import Agent, AgentSession, ContextProvider, SessionContext


class UserMemoryProvider(ContextProvider):
    """A context provider that remembers user info in session state."""

    DEFAULT_SOURCE_ID = "user_memory"

    def __init__(self):
        super().__init__(self.DEFAULT_SOURCE_ID)

    async def before_run(
        self,
        *,
        agent: Any,
        session: AgentSession | None,
        context: SessionContext,
        state: dict[str, Any],
    ) -> None:
        """Inject personalization instructions based on stored user info."""
        user_name = state.get("user_name")
        if user_name:
            context.extend_instructions(
                self.source_id,
                f"The user's name is {user_name}. Always address them by name.",
            )
        else:
            context.extend_instructions(
                self.source_id,
                "You don't know the user's name yet. Ask for it politely.",
            )

    async def after_run(
        self,
        *,
        agent: Any,
        session: AgentSession | None,
        context: SessionContext,
        state: dict[str, Any],
    ) -> None:
        """Extract and store user info in session state after each call."""
        for msg in context.input_messages:
            text = msg.text if hasattr(msg, "text") else ""
            if isinstance(text, str) and "my name is" in text.lower():
                state["user_name"] = text.lower().split("my name is")[-1].strip().split()[0].capitalize()`;

export const STEP4_RUN = String.raw`agent = Agent(
    client=client,
    name="MemoryAgent",
    instructions="You are a friendly assistant.",
    context_providers=[UserMemoryProvider()],
)

session = agent.create_session()

# The provider doesn't know the user yet — it will ask for a name
result = await agent.run("Hello! What's the square root of 9?", session=session)
print(f"Agent: {result}\n")

# Now provide the name — the provider stores it in session state
result = await agent.run("My name is Alice", session=session)
print(f"Agent: {result}\n")

# Subsequent calls are personalized — name persists via session state
result = await agent.run("What is 2 + 2?", session=session)
print(f"Agent: {result}\n")

# Inspect session state to see what the provider stored
provider_state = session.state.get("user_memory", {})
print(f"[Session State] Stored user name: {provider_state.get('user_name')}")`;

export const STEP4_LAYERED = String.raw`from agent_framework import InMemoryHistoryProvider
from agent_framework.mem0 import Mem0ContextProvider

memory_store = InMemoryHistoryProvider(load_messages=True) # add local history for a reused or serialized session
agent_memory = Mem0ContextProvider("user-memory", api_key=..., agent_id="my-agent")  # add Mem0 provider for agent memory
audit_store = InMemoryHistoryProvider(
    "audit",
    load_messages=False,
    store_context_messages=True,  # include context added by other providers
)

agent = client.as_agent(
    name="MemoryAgent",
    instructions="You are a friendly assistant.",
    context_providers=[memory_store, agent_memory, audit_store],  # audit store last
)`;

export const STEP5_WORKFLOW = String.raw`from typing_extensions import Never

from agent_framework import Executor, WorkflowBuilder, WorkflowContext, executor, handler


# Step 1: A class-based executor that converts text to uppercase
class UpperCase(Executor):
    def __init__(self, id: str):
        super().__init__(id=id)

    @handler
    async def to_upper_case(self, text: str, ctx: WorkflowContext[str]) -> None:
        """Convert input to uppercase and forward to the next node."""
        await ctx.send_message(text.upper())

# Step 2: A function-based executor that reverses the string and yields output
@executor(id="reverse_text")
async def reverse_text(text: str, ctx: WorkflowContext[Never, str]) -> None:
    """Reverse the string and yield the final workflow output."""
    await ctx.yield_output(text[::-1])

def create_workflow():
    """Build the workflow: UpperCase → reverse_text."""
    upper = UpperCase(id="upper_case")
    return WorkflowBuilder(start_executor=upper).add_edge(upper, reverse_text).build()


workflow = create_workflow()

events = await workflow.run("hello world")
print(f"Output: {events.get_outputs()}")
print(f"Final state: {events.get_final_state()}")`;

export const STEP6_HARNESS = String.raw`from agent_framework import create_harness_agent
from agent_framework.openai import OpenAIChatClient

agent = create_harness_agent(
    OpenAIChatClient(model="gpt-4o"),
)

# A session carries the harness state (plan, todos, history) across turns.
session = agent.create_session()

print("Harness agent ready. Type 'exit' to quit.")
while True:
    user_input = input("> ")
    if user_input.strip().lower() in {"exit", "quit"}:
        break

    # Stream this turn's output as the harness plans and works through the request.
    async for chunk in agent.run(user_input, session=session, stream=True):
        if chunk.text:
            print(chunk.text, end="", flush=True)
    print()`;

// Reference pattern: steps 1–4 assembled into one memory agent.
export const MEMORY_AGENT_ASSEMBLED = String.raw`# memory_agent.py — reference pattern assembled from steps 1–4
import asyncio
import os
from random import randint
from typing import Annotated, Any

from agent_framework import (
    Agent,
    AgentSession,
    ContextProvider,
    InMemoryHistoryProvider,
    SessionContext,
    tool,
)
from agent_framework.foundry import FoundryChatClient
from azure.identity import DefaultAzureCredential
from pydantic import Field


# --- Tool (step 2) -----------------------------------------------------------
@tool(approval_mode="never_require")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    conditions = ["sunny", "cloudy", "rainy", "stormy"]
    return f"The weather in {location} is {conditions[randint(0, 3)]} with a high of {randint(10, 30)}°C."


# --- Long-term memory (step 4, extended with a home city) ---------------------
class UserMemoryProvider(ContextProvider):
    """Remembers the user's name and home city in session state."""

    DEFAULT_SOURCE_ID = "user_memory"

    def __init__(self):
        super().__init__(self.DEFAULT_SOURCE_ID)

    async def before_run(self, *, agent: Any, session: AgentSession | None,
                         context: SessionContext, state: dict[str, Any]) -> None:
        facts = []
        if state.get("user_name"):
            facts.append(f"The user's name is {state['user_name']}. Address them by name.")
        else:
            facts.append("You don't know the user's name yet. Ask for it politely.")
        if state.get("home_city"):
            facts.append(f"The user lives in {state['home_city']}. Use it when they say 'home'.")
        context.extend_instructions(self.source_id, " ".join(facts))

    async def after_run(self, *, agent: Any, session: AgentSession | None,
                        context: SessionContext, state: dict[str, Any]) -> None:
        for msg in context.input_messages:
            text = (msg.text if hasattr(msg, "text") else "") or ""
            lower = text.lower()
            if "my name is" in lower:
                state["user_name"] = lower.split("my name is")[-1].strip().split()[0].capitalize()
            if "i live in" in lower:
                state["home_city"] = lower.split("i live in")[-1].strip().split()[0].strip(".,!?").capitalize()


def build_agent() -> Agent:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ.get("AZURE_AI_MODEL_DEPLOYMENT_NAME", "gpt-4o"),
        credential=DefaultAzureCredential(),
    )
    return Agent(
        client=client,
        name="MemoryAgent",
        instructions="You are a friendly personal assistant. Keep answers brief.",
        tools=[get_weather],
        context_providers=[
            InMemoryHistoryProvider(load_messages=True),  # short-term: conversation history
            UserMemoryProvider(),                          # long-term: facts about the user
        ],
    )


async def main() -> None:
    agent = build_agent()
    session = agent.create_session()   # step 3: one session per user conversation

    for prompt in [
        "Hi there!",
        "My name is Alice and I live in Amsterdam.",
        "What's the weather like at home?",
        "What do you know about me?",
    ]:
        print(f"> {prompt}")
        print(f"Agent: {await agent.run(prompt, session=session)}\n")

    print("[memory]", session.state.get("user_memory", {}))


if __name__ == "__main__":
    asyncio.run(main())`;

// ---------------------------------------------------------------------------
// Hosting: agent entry points (same container, different homes)
// ---------------------------------------------------------------------------

export const HOST_AF_REQUIREMENTS = String.raw`agent-framework
agent-framework-foundry-hosting
azure-identity
python-dotenv`;

export const HOST_AF_MAIN = String.raw`import os

from agent_framework import Agent
from agent_framework.foundry import FoundryChatClient
from agent_framework_foundry_hosting import ResponsesHostServer
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables from a .env file when present.
load_dotenv()

def main() -> None:
    client = FoundryChatClient(
        project_endpoint=os.environ["FOUNDRY_PROJECT_ENDPOINT"],
        model=os.environ["AZURE_AI_MODEL_DEPLOYMENT_NAME"],
        credential=DefaultAzureCredential(),
    )

    agent = Agent(
        client=client,
        instructions="You are a friendly assistant. Keep your answers brief.",
        # The hosting infrastructure manages conversation history, so the
        # service doesn't need to store it.
        default_options={"store": False},
    )

    server = ResponsesHostServer(agent)
    server.run()

if __name__ == "__main__":
    main()`;

export const HOST_LG_REQUIREMENTS = String.raw`langchain-azure-ai[hosting]>=1.2.9
langchain
langchain-openai
azure-ai-projects
azure-identity`;

export const HOST_LG_MAIN = String.raw`import os

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

from langchain_azure_ai.agents.hosting import ResponsesHostServer

_AZURE_AI_SCOPE = "https://ai.azure.com/.default"

def build_chat_model() -> ChatOpenAI:
    project_endpoint = os.environ["FOUNDRY_PROJECT_ENDPOINT"].rstrip("/")
    deployment = os.environ.get("FOUNDRY_MODEL_NAME", "gpt-4.1")
    credential = DefaultAzureCredential()
    project = AIProjectClient(endpoint=project_endpoint, credential=credential)
    openai_client = project.get_openai_client()
    token_provider = get_bearer_token_provider(credential, _AZURE_AI_SCOPE)

    return ChatOpenAI(
        model=deployment,
        base_url=str(openai_client.base_url),
        api_key=token_provider,
    )

def main() -> None:
    # MemorySaver is for local testing. In production use a durable
    # checkpointer so graph state survives container restarts.
    graph = create_agent(build_chat_model(), tools=[], checkpointer=MemorySaver())
    port = int(os.environ.get("PORT", "8088"))
    ResponsesHostServer(graph).run(port=port)

if __name__ == "__main__":
    main()`;

// Reference pattern: container image usable by all three targets.
export const DOCKERFILE = String.raw`# Dockerfile — reference pattern
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# The Foundry protocol host listens on 8088 and exposes /readiness
EXPOSE 8088
CMD ["python", "main.py"]`;

export const DOCKER_BUILD = String.raw`docker build --platform linux/amd64 -t memory-agent:v1 .
az acr login --name myregistry
docker tag memory-agent:v1 myregistry.azurecr.io/memory-agent:v1
docker push myregistry.azurecr.io/memory-agent:v1`;

// Microsoft docs: deploy to Foundry hosted agents with azd.
export const DEPLOY_FOUNDRY = String.raw`# Install the AI agent extension and sign in
azd ext install azure.ai.agents
azd auth login

# Start from a sample manifest (Agent Framework shown; LangGraph samples live in langchain-azure)
azd ai agent init -m https://github.com/microsoft/agent-framework/blob/main/python/samples/04-hosting/foundry-hosted-agents/responses/basic/agent.manifest.yaml

# Run and test the container locally on http://localhost:8088
azd ai agent run
azd ai agent invoke --local "Hello!"

# Provision the Foundry project, model, ACR and App Insights, then deploy
azd provision
azd deploy

# Inspect the deployed version
azd ai agent show`;

// Reference pattern: AKS with workload identity.
export const DEPLOY_AKS_SETUP = String.raw`# Reference pattern — AKS with Microsoft Entra Workload ID
RG=rg-agents; AKS=aks-agents; NS=agents; SA=memory-agent

az aks update -g $RG -n $AKS --enable-oidc-issuer --enable-workload-identity
az aks update -g $RG -n $AKS --attach-acr myregistry

# User-assigned managed identity the pod will run as
az identity create -g $RG -n id-memory-agent
CLIENT_ID=$(az identity show -g $RG -n id-memory-agent --query clientId -o tsv)
PRINCIPAL_ID=$(az identity show -g $RG -n id-memory-agent --query principalId -o tsv)
ISSUER=$(az aks show -g $RG -n $AKS --query oidcIssuerProfile.issuerUrl -o tsv)

# Trust tokens issued to the Kubernetes service account
az identity federated-credential create -g $RG --identity-name id-memory-agent \
  --name fic-memory-agent --issuer $ISSUER \
  --subject system:serviceaccount:$NS:$SA --audience api://AzureADTokenExchange

# Least privilege: allow calling models through the Foundry project
az role assignment create --assignee-object-id $PRINCIPAL_ID \
  --assignee-principal-type ServicePrincipal \
  --role "Foundry User" --scope <foundry-project-resource-id>`;

export const DEPLOY_AKS_MANIFEST = String.raw`# k8s/memory-agent.yaml — reference pattern
apiVersion: v1
kind: ServiceAccount
metadata:
  name: memory-agent
  namespace: agents
  annotations:
    azure.workload.identity/client-id: "<CLIENT_ID>"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memory-agent
  namespace: agents
spec:
  replicas: 1   # scale out only after memory moves to an external store
  selector:
    matchLabels: { app: memory-agent }
  template:
    metadata:
      labels:
        app: memory-agent
        azure.workload.identity/use: "true"
    spec:
      serviceAccountName: memory-agent
      containers:
        - name: agent
          image: myregistry.azurecr.io/memory-agent:v1
          ports: [{ containerPort: 8088 }]
          env:
            - name: FOUNDRY_PROJECT_ENDPOINT
              value: "https://<resource>.services.ai.azure.com/api/projects/<project>"
            - name: AZURE_AI_MODEL_DEPLOYMENT_NAME
              value: "gpt-4.1"
          readinessProbe:
            httpGet: { path: /readiness, port: 8088 }
          resources:
            requests: { cpu: "500m", memory: "1Gi" }
            limits:   { cpu: "1",    memory: "2Gi" }
---
apiVersion: v1
kind: Service
metadata:
  name: memory-agent
  namespace: agents
spec:
  selector: { app: memory-agent }
  ports: [{ port: 80, targetPort: 8088 }]
  type: ClusterIP   # expose through an authenticated ingress / API Management`;

// Reference pattern: Azure App Service (Web App for Containers).
export const DEPLOY_WEBAPP = String.raw`# Reference pattern — Azure App Service (Linux container)
RG=rg-agents; APP=memory-agent-app

az appservice plan create -g $RG -n plan-agents --is-linux --sku P1v3
az webapp create -g $RG -p plan-agents -n $APP \
  --container-image-name myregistry.azurecr.io/memory-agent:v1

# System-assigned managed identity for ACR pulls and model calls
PRINCIPAL_ID=$(az webapp identity assign -g $RG -n $APP --query principalId -o tsv)
az role assignment create --assignee $PRINCIPAL_ID --role AcrPull \
  --scope $(az acr show -n myregistry --query id -o tsv)
az webapp config set -g $RG -n $APP \
  --generic-configurations '{"acrUseManagedIdentityCreds": true}'

az role assignment create --assignee $PRINCIPAL_ID \
  --role "Foundry User" --scope <foundry-project-resource-id>

# Container settings (the platform does NOT inject these outside Foundry)
az webapp config appsettings set -g $RG -n $APP --settings \
  WEBSITES_PORT=8088 \
  FOUNDRY_PROJECT_ENDPOINT="https://<resource>.services.ai.azure.com/api/projects/<project>" \
  AZURE_AI_MODEL_DEPLOYMENT_NAME="gpt-4.1"

# Then enable App Service Authentication (Microsoft Entra) so the endpoint is not anonymous.`;

export const INVOKE_RESPONSES = String.raw`curl -sS -H "Content-Type: application/json" \
  -X POST http://localhost:8088/responses \
  -d '{"input":"My name is Alice. What can you do?","stream":false}'

# Continue the conversation
curl -sS -H "Content-Type: application/json" \
  -X POST http://localhost:8088/responses \
  -d '{"input":"What is my name?","previous_response_id":"<previous-response-id>","stream":false}'`;

// ---------------------------------------------------------------------------
// Governance
// ---------------------------------------------------------------------------

export const GRAPH_LIST_AGENTS = String.raw`Connect-MgGraph -Scopes 'CopilotPackages.Read.All'

$uri = "https://graph.microsoft.com/v1.0/copilot/admin/catalog/packages"
$agentCount = 0

do {
    $response = Invoke-MgGraphRequest -Method GET -Uri $uri
    $agentCount += @($response.value).Count
    $response.value | ForEach-Object { Write-Host $_.displayName }
    $uri = $response.'@odata.nextLink'
} while ($uri)

Write-Host "Total agents: $agentCount"`;
