from typing import List

from fastapi import APIRouter, HTTPException, Depends
from starlette import status

from middlewares.accessmiddleware import get_current_user_with_role
from services.deliverydriverauth import oauth2_scheme
from services.deliverydriverservice import get_all, get_by_id, update, delete

router = APIRouter()


async def delivery_driver_required(token: str = Depends(oauth2_scheme)):
    return await get_current_user_with_role("delivery_driver", token)


@router.get("/drivers", response_model=List[dict], status_code=status.HTTP_200_OK,
            description="get all delivery drivers")
async def get_all_drivers():
    try:
        drivers = await get_all()
        return drivers
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/drivers/{driver_id}", response_model=dict, status_code=status.HTTP_200_OK,
            description="get driver details by id")
async def get_driver_by_id(driver_id: str):
    try:
        driver = await get_by_id(driver_id)
        if driver is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
        return driver
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/drivers/{driver_id}", response_model=dict, status_code=status.HTTP_200_OK,
            description="update driver details")
async def update_driver(driver_id: str, update_data: dict):
    try:
        updated_driver = await update(driver_id, update_data)
        if not updated_driver:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
        return updated_driver
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/drivers/{driver_id}", status_code=status.HTTP_204_NO_CONTENT,
               description="delete driver details", dependencies=[Depends(delivery_driver_required)])
async def delete_driver(driver_id: str,
                        driver_data: dict = Depends(delivery_driver_required)):
    try:
        deleted_count = await delete(driver_id)
        if deleted_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
