// Code shown on the AI Gateway page.
// Policy element names follow the Azure API Management AI gateway docs; the full policy
// and client snippets are reference patterns — validate against your APIM instance.

export const CLIENT_KEY = String.raw`# pip install openai
import os
from openai import AzureOpenAI

client = AzureOpenAI(
    # The gateway URL — never the Foundry endpoint directly
    azure_endpoint="https://<apim-name>.azure-api.net/<api-path>",
    # APIM subscription key, sent in the api-key header. Load it from Key Vault.
    api_key=os.environ["APIM_SUBSCRIPTION_KEY"],
    api_version="2024-10-21",
)

resp = client.chat.completions.create(
    model="gpt-4o",  # deployment name behind the gateway
    messages=[{"role": "user", "content": "Summarise our leave policy in one line."}],
)
print(resp.choices[0].message.content)
print("tokens used:", resp.usage.total_tokens)`;

export const CLIENT_ENTRA = String.raw`# pip install openai azure-identity
from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AzureOpenAI

# On AKS this resolves to Workload ID, on App Service to the managed identity.
token_provider = get_bearer_token_provider(
    DefaultAzureCredential(),
    "api://<gateway-app-id>/.default",   # the gateway's Entra app registration
)

client = AzureOpenAI(
    azure_endpoint="https://<apim-name>.azure-api.net/<api-path>",
    azure_ad_token_provider=token_provider,
    api_version="2024-10-21",
)

resp = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello from AKS"}],
)
print(resp.choices[0].message.content)`;

export const CLIENT_CURL = String.raw`curl -sS -i \
  "https://<apim-name>.azure-api.net/<api-path>/openai/deployments/gpt-4o/chat/completions?api-version=2024-10-21" \
  -H "api-key: $APIM_SUBSCRIPTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Look for:  HTTP/1.1 200   and   x-remaining-tokens: <n>
# Over quota: HTTP/1.1 429 with a Retry-After header`;

export const POLICY_XML = String.raw`<!-- Reference pattern: AI gateway policy for a Foundry model API -->
<policies>
  <inbound>
    <base />
    <!-- 1. Who is calling? Entra token from the app's managed identity -->
    <validate-azure-ad-token tenant-id="{tenant-id}">
      <client-application-ids>
        <application-id>{consumer-app-id}</application-id>
      </client-application-ids>
    </validate-azure-ad-token>

    <!-- 2. Token budget per consumer (TPM + quota) -->
    <llm-token-limit counter-key="@(context.Subscription.Id)"
        tokens-per-minute="10000" estimate-prompt-tokens="true"
        remaining-tokens-header-name="x-remaining-tokens" />

    <!-- 3. Prompt Shields / content safety before the model sees it -->
    <llm-content-safety backend-id="content-safety" shield-prompt="true" />

    <!-- 4. Reuse answers to semantically similar prompts -->
    <llm-semantic-cache-lookup score-threshold="0.05"
        embeddings-backend-id="embeddings" embeddings-backend-auth="system-assigned" />

    <!-- 5. Keyless call to Foundry with the gateway's managed identity -->
    <authentication-managed-identity resource="https://cognitiveservices.azure.com" />

    <!-- 6. Pool: PTU first (priority 1), pay-as-you-go fallback, circuit breaker -->
    <set-backend-service backend-id="foundry-pool" />
  </inbound>
  <outbound>
    <base />
    <llm-semantic-cache-store duration="120" />
    <!-- 7. Token metrics per consumer to Application Insights -->
    <llm-emit-token-metric namespace="llm-metrics">
      <dimension name="Subscription ID" />
      <dimension name="API ID" />
    </llm-emit-token-metric>
  </outbound>
</policies>`;
