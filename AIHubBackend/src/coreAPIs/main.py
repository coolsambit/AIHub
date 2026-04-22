from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from coreAPIs.projects.api import router as projects_router
from coreAPIs.models.api import router as models_router
from coreAPIs.subscriptions.api import router as subscriptions_router
from coreAPIs.foundries.api import router as foundries_router
from coreAPIs.agents.api import router as agents_router
from coreAPIs.connections.api import router as connections_router


app = FastAPI(title="Core APIs Service", version="1.0.0")

# Add CORS middleware to allow frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend URL(s) for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers for each core API module

app.include_router(projects_router, prefix="/projects", tags=["projects"])
app.include_router(models_router, prefix="/models", tags=["models"])
app.include_router(subscriptions_router, prefix="/subscriptions", tags=["subscriptions"])
app.include_router(foundries_router, prefix="/foundries", tags=["foundries"])
app.include_router(agents_router, prefix="/agents", tags=["agents"])
app.include_router(connections_router, prefix="/connections", tags=["connections"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("coreAPIs.main:app", host="0.0.0.0", port=8020, reload=True)
