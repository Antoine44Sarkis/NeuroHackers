import { Device, Summary } from '../types/device';

const API_BASE = "http://192.168.0.103:8000";

export const fetchDevices = async (): Promise<Device[]> => {
  const response = await fetch(`${API_BASE}/api/devices`);
  if (!response.ok) throw new Error("Failed to fetch devices");
  return response.json();
};

export const fetchSummary = async (): Promise<Summary> => {
  const response = await fetch(`${API_BASE}/api/summary`);
  if (!response.ok) throw new Error("Failed to fetch summary");
  return response.json();
};

export const performDeviceAction = async (
  deviceId: number,
  action: string,
  category: string | null = null
): Promise<void> => {
  const body: { action: string; category?: string | null } = { action };
  if (category) body.category = category;

  const response = await fetch(
    `${API_BASE}/api/devices/${deviceId}/actions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) throw new Error("Action failed");
};