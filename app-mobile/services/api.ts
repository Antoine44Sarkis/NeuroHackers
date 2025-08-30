import { Device, Summary } from "../constants/Types";
// @ts-ignore
import { API_BASE } from "@env";

const API_BASE_URL = API_BASE;

export const fetchDevices = async (): Promise<Device[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices`);
    if (!response.ok) throw new Error("Failed to fetch devices");
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export const fetchSummary = async (): Promise<Summary> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/summary`);
    if (!response.ok) throw new Error("Failed to fetch summary");
    return await response.json();
  } catch (error) {
    console.error("Summary fetch error:", error);
    throw error;
  }
};

export const performDeviceAction = async (
  deviceId: number,
  action: string,
  category: string | null = null
): Promise<Device> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/devices/${deviceId}/actions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, category }),
      }
    );

    if (!response.ok) throw new Error(`Failed to ${action} device`);
    return await response.json();
  } catch (error) {
    console.error("Action error:", error);
    throw error;
  }
};
