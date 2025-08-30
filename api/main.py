from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional, List
import json
import os
from datetime import datetime
from enum import Enum

app = FastAPI(
    title="Chimera Device API", 
    version="1.0.0",
    description="API for managing and visualizing network devices"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICES_FILE = "devices.sample.json"
devices_data = []

def load_devices():
    global devices_data
    try:
        with open(DEVICES_FILE, 'r') as f:
            devices_data = json.load(f)
    except FileNotFoundError:
        raise Exception(f"Device file {DEVICES_FILE} not found")
    except json.JSONDecodeError:
        raise Exception(f"Invalid JSON in {DEVICES_FILE}")

def save_devices():
    try:
        with open(DEVICES_FILE, 'w') as f:
            json.dump(devices_data, f, indent=2)
    except IOError as e:
        raise Exception(f"Failed to save devices: {str(e)}")

load_devices()

class ActionType(str, Enum):
    ISOLATE = "isolate"
    RELEASE = "release"
    TOGGLE_BLOCK = "toggle_block"

class Group(BaseModel):
    id: int
    name: str
    is_default: bool

class Blocklist(BaseModel):
    ads_trackers: bool = False
    gambling: bool = False
    social_media: bool = False
    porn: bool = False
    gaming: bool = False
    streaming: bool = False
    facebook: bool = False
    instagram: bool = False
    tiktok: bool = False
    netflix: bool = False
    youtube: bool = False
    ai: bool = False
    safesearch: bool = True

class AIClassification(BaseModel):
    device_type: str
    device_category: str
    confidence: float = Field(..., ge=0, le=1)
    reasoning: str
    indicators: List[str]
    last_classified: str

class Device(BaseModel):
    id: int
    mac: Optional[str] = None
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    given_name: Optional[str] = None
    ip: Optional[str] = None
    user_agent: List[str] = []
    group: Group
    is_active: bool
    has_custom_blocklist: bool
    first_seen: str
    last_seen: str
    is_mac_universal: bool
    os_name: str
    os_accuracy: int = Field(..., ge=0, le=100)
    os_type: Optional[str] = None
    os_vendor: Optional[str] = None
    os_family: Optional[str] = None
    os_gen: Optional[str] = None
    os_cpe: List[str] = []
    os_last_updated: str
    blocklist: Blocklist
    ai_classification: AIClassification

class DeviceUpdate(BaseModel):
    given_name: Optional[str] = None
    group: Optional[Dict[str, Any]] = None
    blocklist: Optional[Dict[str, bool]] = None

    @validator('blocklist')
    def validate_blocklist(cls, v):
        if v:
            valid_keys = Blocklist.schema()['properties'].keys()
            for key in v.keys():
                if key not in valid_keys:
                    raise ValueError(f"Invalid blocklist category: {key}")
        return v

class DeviceAction(BaseModel):
    action: ActionType
    category: Optional[str] = None

    @validator('category')
    def validate_category(cls, v, values):
        if values.get('action') == ActionType.TOGGLE_BLOCK and not v:
            raise ValueError('Category is required for toggle_block action')
        
        if v and v not in Blocklist.schema()['properties'].keys():
            raise ValueError(f"Invalid category: {v}")
        return v

def find_device_by_id(device_id: int):
    for device in devices_data:
        if device["id"] == device_id:
            return device
    return None

def update_group_info(device: Dict, group_id: int):
    """Update group name and is_default based on group ID"""
    group_mapping = {
        1: {"name": "Default Group", "is_default": True},
        2: {"name": "Staff", "is_default": False},
        3: {"name": "Guests", "is_default": False},
        4: {"name": "IoT", "is_default": False}
    }
    
    if group_id in group_mapping:
        device["group"]["id"] = group_id
        device["group"]["name"] = group_mapping[group_id]["name"]
        device["group"]["is_default"] = group_mapping[group_id]["is_default"]
    else:
        raise HTTPException(status_code=400, detail=f"Invalid group ID: {group_id}")

@app.get("/api/devices", response_model=List[Device])
async def get_devices():
    """Get all devices"""
    return devices_data

@app.get("/api/summary")
async def get_summary():
    """Get device summary statistics"""
    total = len(devices_data)
    active = sum(1 for device in devices_data if device["is_active"])
    
    by_group = {}
    for device in devices_data:
        group_name = device["group"]["name"]
        by_group[group_name] = by_group.get(group_name, 0) + 1
    
    by_category = {}
    for device in devices_data:
        category = device["ai_classification"]["device_category"]
        by_category[category] = by_category.get(category, 0) + 1
    
    risk_levels = {"high": 0, "medium": 0, "low": 0}
    for device in devices_data:
        blocked_count = sum(1 for v in device["blocklist"].values() if v)
        if blocked_count > 8:
            risk_levels["high"] += 1
        elif blocked_count > 4:
            risk_levels["medium"] += 1
        else:
            risk_levels["low"] += 1
    
    return {
        "total": total,
        "active": active,
        "by_group": by_group,
        "by_category": by_category,
        "by_risk": risk_levels
    }

@app.patch("/api/devices/{device_id}", response_model=Device)
async def update_device(device_id: int, update_data: DeviceUpdate):
    """Update device properties"""
    device = find_device_by_id(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    if update_data.given_name is not None:
        device["given_name"] = update_data.given_name
    
    if update_data.group is not None and "id" in update_data.group:
        update_group_info(device, update_data.group["id"])
    
    if update_data.blocklist is not None:
        for key, value in update_data.blocklist.items():
            device["blocklist"][key] = value
        device["has_custom_blocklist"] = True
    
    save_devices()
    return device

@app.post("/api/devices/{device_id}/actions", response_model=Device)
async def device_action(device_id: int, action_data: DeviceAction):
    """Perform actions on device (isolate, release, toggle_block)"""
    device = find_device_by_id(device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    action = action_data.action
    
    if action == ActionType.ISOLATE:
        for key in device["blocklist"]:
            device["blocklist"][key] = True
        device["has_custom_blocklist"] = True
        
    elif action == ActionType.RELEASE:
        for key in device["blocklist"]:
            if key == "safesearch":
                device["blocklist"][key] = True
            else:
                device["blocklist"][key] = False
        device["has_custom_blocklist"] = True
        
    elif action == ActionType.TOGGLE_BLOCK:
        category = action_data.category
        device["blocklist"][category] = not device["blocklist"][category]
        device["has_custom_blocklist"] = True
    
    save_devices()
    return device

@app.get("/")
async def root():
    return {"message": "Chimera Device API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)