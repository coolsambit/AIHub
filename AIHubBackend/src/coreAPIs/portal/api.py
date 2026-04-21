from fastapi import APIRouter

router = APIRouter()

# Router for portal-related endpoints
@router.get("/", summary="Portal status")
def portal_status():
    """Return a simple portal status."""
    return {"status": "ok"}
