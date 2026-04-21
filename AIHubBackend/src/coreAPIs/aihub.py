from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlencode, urlparse

import requests
from azure.identity import DefaultAzureCredential


@dataclass
class EndpointParts:
    """Parsed pieces from a Foundry endpoint used to compose REST paths."""
    base_url: str
    account_name: str
    project_name: str


class AIHub:
    """Small HTTP helper around Foundry REST endpoints using Entra tokens."""
    def __init__(self, endpoint: str, credential: DefaultAzureCredential) -> None:
        self.endpoint = endpoint
        self.credential = credential
        self.parts = self._parse_endpoint(endpoint)

    @staticmethod
    def _parse_endpoint(endpoint: str) -> EndpointParts:
        """Extract base URL, account name, and project name from endpoint URI."""
        parsed = urlparse(endpoint)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError(f"Invalid Foundry endpoint: {endpoint}")

        host_parts = parsed.netloc.split(".")
        if not host_parts:
            raise ValueError(f"Unable to parse account name from endpoint: {endpoint}")

        path_parts = [p for p in parsed.path.split("/") if p]
        project_name = ""
        if len(path_parts) >= 3 and path_parts[0] == "api" and path_parts[1] == "projects":
            project_name = path_parts[2]

        # Some account-level calls (for example project discovery) only need
        # the host/account and do not require a concrete project path.

        return EndpointParts(
            base_url=f"{parsed.scheme}://{parsed.netloc}",
            account_name=host_parts[0],
            project_name=project_name,
        )

    def _get(self, path: str, *, api_version: str) -> list[dict]:
        """Issue an authenticated GET and normalize list payload shapes."""
        token = self.credential.get_token("https://ai.azure.com/.default")
        query = urlencode({"api-version": api_version})
        url = f"{self.parts.base_url}{path}?{query}"
        response = requests.get(
            url,
            headers={"Authorization": f"Bearer {token.token}"},
            timeout=30,
        )

        response.raise_for_status()
        try:
            payload = response.json()
        except Exception:
            # Return the raw response text for debugging
            from fastapi import HTTPException
            raise HTTPException(status_code=502, detail=f"Non-JSON response from Foundry endpoint: {response.text}")

        if isinstance(payload, dict):
            for key in ("value", "items"):
                value = payload.get(key)
                if isinstance(value, list):
                    return [item for item in value if isinstance(item, dict)]
            return []

        if isinstance(payload, list):
            return [item for item in payload if isinstance(item, dict)]

        return []
