import os

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from jose import jwt
from pydantic import json

from services.lg import logger
from models.connecteddriverssingleton import connected_drivers  # Import the singleton instance


router = APIRouter()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')

if not SECRET_KEY or not ALGORITHM:
    raise RuntimeError("SECRET_KEY and ALGORITHM must be set in environment variables")


@router.websocket(path="/ws/drivers/{driver_id}")
async def websocket_endpoint(websocket: WebSocket, driver_id: str):
    try:
        # Authenticate driver
        token = websocket.query_params.get("token")
        if not token:
            await websocket.close(code=1008, reason="Missing token")
            return

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_role = payload.get("role")
        if user_role != "delivery_driver":
            await websocket.close(code=1008, reason="Invalid role")
            return

        # Accept WebSocket connection
        await websocket.accept()
        logger.info(f"Driver {driver_id} connected to WebSocket.")

        while True:
            # Receive and process location updates
            data = await websocket.receive_text()
            location_data = json.loads(data)

            latitude = location_data.get('latitude')
            longitude = location_data.get('longitude')

            # Update location in the singleton
            connected_drivers.update_location(driver_id, latitude, longitude)

            logger.info(f"Driver {driver_id} updated location: {latitude}, {longitude}")

            await websocket.send_text(f"Location updated for driver {driver_id}")

    except WebSocketDisconnect:
        # Remove driver from the singleton on disconnection
        connected_drivers.remove_driver(driver_id)
        logger.info(f"Driver {driver_id} disconnected.")
        await websocket.close()
