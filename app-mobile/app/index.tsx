import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getGroupColor } from "@/utils/deviceUtils";
import { Ionicons } from "@expo/vector-icons";
import { performDeviceAction } from "@/services/api";
// @ts-ignore
import { API_BASE } from "@env";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type Device = {
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

const DeviceVizMobile = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  type Summary = {
    active?: number;
    total?: number;
    by_risk?: { high?: number; medium?: number; low?: number };
    by_group?: { [group: string]: number };
  };

  const [summary, setSummary] = useState<Summary>({});
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [viewMode, setViewMode] = useState("constellation");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/api/devices`),
        fetch(`${API_BASE}/api/summary`),
      ]);

      if (!devicesRes.ok || !summaryRes.ok) {
        throw new Error("Network response was not ok");
      }

      const devicesData = await devicesRes.json();
      const summaryData = await summaryRes.json();

      setDevices(devicesData);
      setSummary(summaryData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert(
        "Error",
        "Failed to connect to API. Make sure your API is running and check the API_BASE URL."
      );
      setLoading(false);
    }
  };

  const performAction = async (
    deviceId: any,
    action: string,
    category: string | null = null
  ) => {
    try {
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

      if (response.ok) {
        await fetchData();
        if (action !== "toggle_block") {
          Alert.alert(
            "Success",
            `Action \"${action}\" completed successfully.`
          );
        }
      } else {
        throw new Error("Action failed");
      }
    } catch (error) {
      console.error("Action failed:", error);
      Alert.alert("Error", "Failed to perform action. Please try again.");
    }
  };

  const getDeviceIcon = (category: string | number) => {
    const icons = {
      Mobile: "📱",
      "Network Infrastructure": "🌐",
      IoT: "📹",
      Printer: "🖨️",
      Workstation: "💻",
      "File Server": "🗄️",
      Gateway: "🚪",
      "Lobby AP": "📶",
      NAS: "💾",
    };
    return icons[String(category) as keyof typeof icons] || "💻";
  };

  type Device = {
    blocklist: { [key: string]: boolean };
    [key: string]: any;
  };

  const getRiskLevel = (device: Device) => {
    const blockedCount = Object.entries(device.blocklist).filter(
      ([key, value]) => value && key !== "safesearch"
    ).length;

    if (blockedCount > 8) return "high";
    if (blockedCount > 4) return "medium";
    return "low";
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      high: "#EF4444",
      medium: "#F59E0B",
      low: "#22C55E",
    };
    return colors[risk as keyof typeof colors] || "#6B7280";
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        device.given_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup =
        filterGroup === "all" || device.group.name === filterGroup;
      return matchesSearch && matchesGroup;
    });
  }, [devices, searchTerm, filterGroup]);

  const ConstellationView = () => {
    const containerHeight = 400;
    const centerX = screenWidth * 0.5 - 20;
    const centerY = containerHeight * 0.5;
    const circleRadius = 140;

    return (
      <View
        style={[
          styles.constellationContainer,
          {
            width: screenWidth,
            height: containerHeight,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <View
          style={[
            styles.constellationCenter,
            { left: centerX - 30, top: centerY - 30 },
          ]}
        >
          <Text style={styles.centerText}>🌐</Text>
          <Text style={styles.centerLabel}>Network</Text>
        </View>

        {filteredDevices.map((device, index) => {
          const angle = (index / filteredDevices.length) * 2 * Math.PI;
          const x = centerX + circleRadius * Math.cos(angle) - 30;
          const y = centerY + circleRadius * Math.sin(angle) - 30;

          const riskColor = getRiskColor(getRiskLevel(device));
          const groupColor = getGroupColor(device.group.name);

          return (
            <View
              key={device.id}
              style={{
                position: "absolute",
                left: x,
                top: y,
                alignItems: "center",
                width: 60,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.deviceNode,
                  {
                    backgroundColor: groupColor,
                    borderColor: riskColor,
                    borderWidth: 3,
                  },
                ]}
                onPress={() => {
                  setSelectedDevice(device);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.deviceIcon}>
                  {getDeviceIcon(device.ai_classification.device_category)}
                </Text>
                {/* Activity indicator */}
                <View
                  style={[
                    styles.activityIndicator,
                    {
                      backgroundColor: device.is_active ? "#22C55E" : "#6B7280",
                    },
                  ]}
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.deviceLabel,
                  { position: "relative", left: 0, top: 50, width: 80 },
                ]}
              >
                <Text style={styles.labelText} numberOfLines={1}>
                  {device.given_name}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const HeatmapView = () => {
    const itemsPerRow = 3;
    const itemSize = (screenWidth - 60) / itemsPerRow - 10;

    return (
      <View style={styles.heatmapContainer}>
        {filteredDevices.map((device, index) => {
          const risk = getRiskLevel(device);
          const intensity = risk === "high" ? 1 : risk === "medium" ? 0.6 : 0.2;
          const riskColor = getRiskColor(risk);

          return (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.heatmapItem,
                {
                  width: itemSize,
                  height: itemSize,
                  backgroundColor: `rgba(239, 68, 68, ${intensity})`,
                  borderColor: device.is_active ? "#22C55E" : "#6B7280",
                  borderWidth: 2,
                },
              ]}
              onPress={() => {
                setSelectedDevice(device);
                setModalVisible(true);
              }}
            >
              <Text style={styles.heatmapIcon}>
                {getDeviceIcon(device.ai_classification.device_category)}
              </Text>

              <Text style={styles.heatmapLabel} numberOfLines={1}>
                {device.given_name}
              </Text>

              {/* Confidence bar */}
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    { width: `${device.ai_classification.confidence * 100}%` },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const NetworkView = () => {
    const groups = Object.keys(summary.by_group || {});

    return (
      <View style={styles.networkContainer}>
        {groups.map((groupName, groupIndex) => {
          const groupDevices = filteredDevices.filter(
            (d) => d.group.name === groupName
          );
          const centerX = 100 + (groupIndex % 2) * (screenWidth / 2 - 40);
          const centerY = 120 + Math.floor(groupIndex / 2) * 180;

          return (
            <View key={groupName}>
              {/* Group center */}
              <View
                style={[
                  styles.groupCenter,
                  {
                    left: centerX - 30,
                    top: centerY - 30,
                    backgroundColor: getGroupColor(groupName),
                  },
                ]}
              >
                <Text style={styles.groupCount}>{groupDevices.length}</Text>
                <Text style={styles.groupName} numberOfLines={1}>
                  {groupName}
                </Text>
              </View>

              {/* Orbiting devices */}
              {groupDevices.map((device, deviceIndex) => {
                const angle = (deviceIndex / groupDevices.length) * 2 * Math.PI;
                const orbitRadius = 50;
                const x = centerX + orbitRadius * Math.cos(angle) - 15;
                const y = centerY + orbitRadius * Math.sin(angle) - 15;

                return (
                  <TouchableOpacity
                    key={device.id}
                    style={[
                      styles.orbitDevice,
                      {
                        left: x,
                        top: y,
                        backgroundColor: getRiskColor(getRiskLevel(device)),
                      },
                    ]}
                    onPress={() => {
                      setSelectedDevice(device);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.orbitIcon}>
                      {getDeviceIcon(device.ai_classification.device_category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  };

  const DeviceDetailModal = () => {
    if (!selectedDevice) return null;

    const [optimisticDevice, setOptimisticDevice] = useState(selectedDevice);
    useEffect(() => {
      setOptimisticDevice(selectedDevice);
    }, [selectedDevice]);

    const blocklistCategories = Object.entries(optimisticDevice.blocklist);

    const handleBlocklistToggle = async (category: string) => {
      const newBlocklist = {
        ...optimisticDevice.blocklist,
        [category]: !optimisticDevice.blocklist[category],
      };
      setOptimisticDevice({ ...optimisticDevice, blocklist: newBlocklist });
      setSelectedDevice((prev) =>
        prev ? { ...prev, blocklist: newBlocklist } : prev
      );
      setDevices((prev) =>
        prev.map((d) =>
          d.id === optimisticDevice.id ? { ...d, blocklist: newBlocklist } : d
        )
      );
      try {
        const body = { action: "toggle_block", category };
        const response = await fetch(
          `${API_BASE}/api/devices/${optimisticDevice.id}/actions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!response.ok) throw new Error("Action failed");
      } catch (error) {
        const revertedBlocklist = {
          ...optimisticDevice.blocklist,
          [category]: !newBlocklist[category],
        };
        setOptimisticDevice({
          ...optimisticDevice,
          blocklist: revertedBlocklist,
        });
        setSelectedDevice((prev) =>
          prev ? { ...prev, blocklist: revertedBlocklist } : prev
        );
        setDevices((prev) =>
          prev.map((d) =>
            d.id === optimisticDevice.id
              ? { ...d, blocklist: revertedBlocklist }
              : d
          )
        );
        Alert.alert("Error", "Failed to update blocklist. Please try again.");
      }
    };

    const handleQuickAction = async (action: "isolate" | "release") => {
      const newIsActive = action === "release";

      setOptimisticDevice({ ...optimisticDevice, is_active: newIsActive });
      setSelectedDevice((prev) =>
        prev ? { ...prev, is_active: newIsActive } : prev
      );
      setDevices((prev) =>
        prev.map((d) =>
          d.id === optimisticDevice.id ? { ...d, is_active: newIsActive } : d
        )
      );

      try {
        const response = await fetch(
          `${API_BASE}/api/devices/${optimisticDevice.id}/actions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
          }
        );

        if (!response.ok) throw new Error("Action failed");

        const updatedDevice = await response.json();

        setOptimisticDevice(updatedDevice);
        setSelectedDevice(updatedDevice);
        setDevices((prev) =>
          prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d))
        );

        Alert.alert("Success", `Action "${action}" completed successfully.`);
      } catch (error) {
        const revertIsActive = !newIsActive;
        setOptimisticDevice({ ...optimisticDevice, is_active: revertIsActive });
        setSelectedDevice((prev) =>
          prev ? { ...prev, is_active: revertIsActive } : prev
        );
        setDevices((prev) =>
          prev.map((d) =>
            d.id === optimisticDevice.id
              ? { ...d, is_active: revertIsActive }
              : d
          )
        );

        Alert.alert(
          "Error",
          `Failed to perform action "${action}". Please try again.`
        );
      }
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>
                    {optimisticDevice.given_name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {optimisticDevice.hostname} • {optimisticDevice.vendor}
                  </Text>
                  <Text style={styles.modalIP}>{optimisticDevice.ip}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Status */}
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: optimisticDevice.is_active
                        ? "#22C55E"
                        : "#6B7280",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {optimisticDevice.is_active ? "🟢 Online" : "🔴 Offline"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.riskBadge,
                    {
                      backgroundColor: getRiskColor(
                        getRiskLevel(optimisticDevice)
                      ),
                    },
                  ]}
                >
                  <Text style={styles.riskText}>
                    {getRiskLevel(optimisticDevice).toUpperCase()} RISK
                  </Text>
                </View>
              </View>

              {/* Device Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Device Information</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="hardware-chip" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.ai_classification.device_type}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="laptop" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.os_name}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="people" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.group.name}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="stats-chart" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {Math.round(
                        optimisticDevice.ai_classification.confidence * 100
                      )}
                      % Confidence
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.actionSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.isolateButton]}
                    onPress={() => handleQuickAction("isolate")}
                  >
                    <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Isolate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.releaseButton]}
                    onPress={() => handleQuickAction("release")}
                  >
                    <Ionicons name="lock-open" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Release</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content Filtering */}
              <View style={styles.blocklistSection}>
                <Text style={styles.sectionTitle}>Content Filtering</Text>
                <View style={styles.blocklistGrid}>
                  {blocklistCategories.map(([category, blocked]) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.blocklistItem,
                        { backgroundColor: blocked ? "#FEE2E2" : "#F3F4F6" },
                      ]}
                      onPress={() => handleBlocklistToggle(category)}
                    >
                      <Text
                        style={[
                          styles.blocklistText,
                          { color: blocked ? "#DC2626" : "#6B7280" },
                        ]}
                      >
                        {blocked ? "👁️" : "🚫"} {category.replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Network Details */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Network Details</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="hardware-chip" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>{optimisticDevice.mac}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="time" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.is_mac_universal
                        ? "Randomized MAC"
                        : "Fixed MAC"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* OS Details */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Operating System</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons name="stats-chart" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.os_accuracy}% Accuracy
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="business" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.os_vendor}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="git-branch" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      {optimisticDevice.os_family}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar" size={16} color="#6366F1" />
                    <Text style={styles.infoText}>
                      Last updated:{" "}
                      {new Date(
                        optimisticDevice.os_last_updated
                      ).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Activity Timeline */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Activity Timeline</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="arrow-down-circle"
                      size={16}
                      color="#6366F1"
                    />
                    <Text style={styles.infoText}>
                      First seen:{" "}
                      {new Date(optimisticDevice.first_seen).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons
                      name="arrow-up-circle"
                      size={16}
                      color="#6366F1"
                    />
                    <Text style={styles.infoText}>
                      Last seen:{" "}
                      {new Date(optimisticDevice.last_seen).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI Classification Details */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>
                  AI Classification Details
                </Text>
                <Text style={styles.infoTextSmall}>
                  {optimisticDevice.ai_classification.reasoning}
                </Text>
                <View style={styles.chipContainer}>
                  {optimisticDevice.ai_classification.indicators.map(
                    (
                      indicator:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: React.Key | null | undefined
                    ) => (
                      <View key={index} style={styles.chip}>
                        <Text style={styles.chipText}>{indicator}</Text>
                      </View>
                    )
                  )}
                </View>
                <Text style={styles.infoTextSmall}>
                  Last classified:{" "}
                  {new Date(
                    optimisticDevice.ai_classification.last_classified
                  ).toLocaleString()}
                </Text>
              </View>

              {/* User Agent */}
              {optimisticDevice.user_agent.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>User Agent</Text>
                  {optimisticDevice.user_agent.map(
                    (
                      ua:
                        | string
                        | number
                        | bigint
                        | boolean
                        | React.ReactElement<
                            unknown,
                            string | React.JSXElementConstructor<any>
                          >
                        | Iterable<React.ReactNode>
                        | React.ReactPortal
                        | Promise<
                            | string
                            | number
                            | bigint
                            | boolean
                            | React.ReactPortal
                            | React.ReactElement<
                                unknown,
                                string | React.JSXElementConstructor<any>
                              >
                            | Iterable<React.ReactNode>
                            | null
                            | undefined
                          >
                        | null
                        | undefined,
                      index: React.Key | null | undefined
                    ) => (
                      <Text key={index} style={styles.infoTextSmall}>
                        {ua}
                      </Text>
                    )
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading device network...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Chimera Network</Text>
          <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{summary.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{summary.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          {summary.by_risk && (
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: "#EF4444" }]}>
                {summary.by_risk.high}
              </Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </View>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search devices..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <View style={styles.pickerContainer}>
            <Ionicons
              name="filter"
              size={16}
              color="#6B7280"
              style={styles.filterIcon}
            />
            <Picker
              selectedValue={filterGroup}
              onValueChange={setFilterGroup}
              style={styles.picker}
            >
              <Picker.Item label="All Groups" value="all" />
              {Object.keys(summary.by_group || {}).map((group) => (
                <Picker.Item key={group} label={group} value={group} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.viewToggle}>
          {[
            { key: "constellation", icon: "planet" },
            { key: "heatmap", icon: "grid" },
            { key: "network", icon: "git-network" },
          ].map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.toggleButton,
                viewMode === mode.key && styles.activeToggle,
              ]}
              onPress={() => setViewMode(mode.key)}
            >
              <Ionicons
                name={mode.icon as any}
                size={20}
                color={viewMode === mode.key ? "#FFFFFF" : "#6B7280"}
              />
              <Text
                style={[
                  styles.toggleText,
                  viewMode === mode.key && styles.activeToggleText,
                ]}
              >
                {mode.key.charAt(0).toUpperCase() + mode.key.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Visualization */}
      <ScrollView
        style={styles.visualizationContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.visualization}>
          {viewMode === "constellation" && <ConstellationView />}
          {viewMode === "heatmap" && <HeatmapView />}
          {viewMode === "network" && <NetworkView />}
        </View>
      </ScrollView>

      <DeviceDetailModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366F1",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  controls: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  filterRow: {
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  filterIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  activeToggle: {
    backgroundColor: "#6366F1",
  },
  toggleText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeToggleText: {
    color: "#FFFFFF",
  },
  visualizationContainer: {
    flex: 1,
  },
  visualization: {
    padding: 20,
    minHeight: 400,
  },

  constellationContainer: {
    height: 400,
    position: "relative",
  },
  constellationCenter: {
    position: "absolute",
    left: screenWidth * 0.5 - 30,
    top: 170,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366F1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  centerText: {
    fontSize: 24,
  },
  centerLabel: {
    position: "absolute",
    top: 65,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "bold",
  },
  deviceNode: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deviceIcon: {
    fontSize: 20,
  },
  activityIndicator: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  riskPulse: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    borderWidth: 2,
  },
  deviceLabel: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 10,
    textAlign: "center",
  },

  heatmapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  heatmapItem: {
    marginBottom: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  heatmapIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  heatmapLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  confidenceBar: {
    width: "80%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#22C55E",
    borderRadius: 2,
  },

  networkContainer: {
    height: 400,
    position: "relative",
  },
  groupCenter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  groupCount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  groupName: {
    position: "absolute",
    top: 65,
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "bold",
    width: 80,
    textAlign: "center",
  },
  orbitDevice: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  orbitIcon: {
    fontSize: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalScroll: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalHeaderContent: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 4,
  },
  modalIP: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  statusContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  riskText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    minWidth: "45%",
  },
  infoText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "500",
  },
  actionSection: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  isolateButton: {
    backgroundColor: "#EF4444",
  },
  releaseButton: {
    backgroundColor: "#22C55E",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  blocklistSection: {
    marginBottom: 20,
  },
  blocklistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  blocklistItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    minWidth: "45%",
  },
  blocklistText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 8,
  },
  chip: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 12,
    color: "#4B5563",
  },
  infoTextSmall: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  osBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#6366F1",
    color: "white",
    fontSize: 8,
    padding: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
});

export default DeviceVizMobile;
