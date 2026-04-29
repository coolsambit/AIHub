from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from coreAPIs.projects.api import router as projects_router
from coreAPIs.models.api import router as models_router
from coreAPIs.subscriptions.api import router as subscriptions_router
from coreAPIs.foundries.api import router as foundries_router
from coreAPIs.agents.api import router as agents_router
from coreAPIs.connections.api import router as connections_router
from coreAPIs.keys.api import router as keys_router
from coreAPIs.Roles.api import router as cs_openai_roles_router

bearer_scheme = HTTPBearer(auto_error=False)

app = FastAPI(
    title="AIHub Core APIs",
    version="1.0.0",
    redirect_slashes=False,
    swagger_ui_parameters={"persistAuthorization": True},
    dependencies=[Depends(bearer_scheme)],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(models_router, prefix="/models", tags=["models"])
app.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])
app.include_router(foundries_router, prefix="/foundries", tags=["foundries"])
app.include_router(agents_router, prefix="/agents", tags=["agents"])
app.include_router(connections_router, prefix="/connections", tags=["connections"])
app.include_router(keys_router, prefix="/keys", tags=["keys"])
app.include_router(cs_openai_roles_router, prefix="/Roles", tags=["Roles"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("coreAPIs.main:app", host="0.0.0.0", port=8020, reload=True)
