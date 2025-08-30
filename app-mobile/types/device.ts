export type Device = {
  id: number;
  given_name: string;
  hostname: string;
  vendor: string;
  ip: string;
  is_active: boolean;
  os_name: string;
  group: { name: string };
  ai_classification: {
    device_category: string;
    device_type: string;
    confidence: number;
  };
  blocklist: { [key: string]: boolean };
  [key: string]: any;
};

export type Summary = {
  active?: number;
  total?: number;
  by_risk?: { high?: number; medium?: number; low?: number };
  by_group?: { [group: string]: number };
};

export type RiskLevel = "high" | "medium" | "low";