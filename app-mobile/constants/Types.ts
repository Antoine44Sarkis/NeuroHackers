export interface DeviceBlocklist {
  [key: string]: boolean;
}

export interface DeviceGroup {
  id: number;
  name: string;
  is_default: boolean;
}

export interface DeviceAIClassification {
  device_category: string;
  device_type: string;
  confidence: number;
}

export interface Device {
  id: number;
  given_name?: string;
  hostname?: string;
  vendor?: string;
  group: DeviceGroup;
  is_active: boolean;
  has_custom_blocklist: boolean;
  blocklist: DeviceBlocklist;
  os_name: string;
  os_accuracy: number;
  os_family?: string;
  ai_classification: DeviceAIClassification;
  ip?: string;
  mac?: string;
  last_seen?: string;
}

export interface Summary {
  total?: number;
  active?: number;
  by_group?: { [key: string]: number };
  by_category?: { [key: string]: number };
  by_risk?: { [key: string]: number };
}

export type ViewMode = 'grid' | 'list' | 'radial';