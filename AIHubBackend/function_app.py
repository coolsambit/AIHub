import sys
import os

# Make sure coreAPIs is importable from the src subfolder
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

import azure.functions as func
from coreAPIs.main import app as fastapi_app

app = func.AsgiFunctionApp(app=fastapi_app, http_auth_level=func.AuthLevel.ANONYMOUS)
