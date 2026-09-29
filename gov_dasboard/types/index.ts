export type UserRole =
  | 'Super Admin'
  | 'State Officer'
  | 'District Officer'
  | 'Pollution Control Officer'
  | 'Municipal Officer'
  | 'Traffic Officer'
  | 'Agriculture Officer'
  | 'Field Officer';

export type Permission =
  | 'view_dashboard'
  | 'view_map'
  | 'view_alerts'
  | 'manage_alerts'
  | 'view_reports'
  | 'review_reports'
  | 'assign_actions'
  | 'approve_actions'
  | 'execute_actions'
  | 'emergency_response'
  | 'generate_reports'
  | 'manage_departments'
  | 'manage_users'
  | 'system_settings';

export interface User {
  id: string;
  name: string;
  badgeNumber: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  jurisdiction: string;
  avatarUrl?: string;
  permissions: Permission[];
}

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type AQICategory = 'Good' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe' | 'Hazardous';
export type SensorStatus = 'Online' | 'Offline' | 'Calibrating' | 'Warning';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Sensor {
  id: string;
  sensorCode: string;
  model: string;
  locationName: string;
  ward: string;
  zone: string;
  coordinates: Coordinates;
  status: SensorStatus;
  currentAQI: number;
  category: AQICategory;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temperature: number;
  humidity: number;
  batteryLevel?: number;
  lastUpdated: string;
}

export interface HistoricalReading {
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2?: number;
  so2?: number;
  co?: number;
}

export type AlertStatus = 'New' | 'Under Review' | 'Assigned' | 'Action In Progress' | 'Resolved' | 'Dismissed';

export interface PollutionAlert {
  id: string;
  alertCode: string;
  severity: SeverityLevel;
  sensorId: string;
  sensorModel: string;
  location: string;
  zone: string;
  coordinates: Coordinates;
  metric: string;
  value: number;
  unit: string;
  threshold: number;
  aqi: number;
  timestamp: string;
  status: AlertStatus;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedOfficer?: string;
  probableSource: string;
  confidenceScore: number; // 0 - 100%
  predictionSummary: string;
  recommendedAction: string;
  nearbySensorCount: number;
  relatedReportIds: string[];
  activityHistory: {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }[];
}

export type ReportType =
  | 'High PM2.5'
  | 'Smoke'
  | 'Dust'
  | 'Open Burning'
  | 'Construction Pollution'
  | 'Poor Air Quality'
  | 'Industrial Pollution'
  | 'Traffic Pollution'
  | 'High Temperature';

export type ReportStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

export interface PollutionReport {
  id: string;
  reportCode: string;
  reporterName: string;
  reporterContact?: string;
  isCitizenReport: boolean;
  location: string;
  ward: string;
  zone: string;
  coordinates: Coordinates;
  issueType: ReportType;
  description: string;
  timestamp: string;
  status: ReportStatus;
  aqiAtReportTime: number;
  photoUrl?: string;
  satelliteEvidenceUrl?: string;
  aiClassification: string;
  probableSource: string;
  confidenceScore: number;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedActionId?: string;
  weatherSnapshot: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
  };
  nearbySensors: {
    sensorId: string;
    name: string;
    distanceKm: number;
    currentAQI: number;
  }[];
  history: {
    id: string;
    timestamp: string;
    status: ReportStatus;
    actor: string;
    notes?: string;
  }[];
}

export type DepartmentStatusType = 'On Track' | 'In Progress' | 'Pending' | 'On Hold' | 'Completed';

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfficer: string;
  contactNumber: string;
  email: string;
  activeActionsCount: number;
  completedActionsCount: number;
  pendingActionsCount: number;
  status: DepartmentStatusType;
  responseRatePercent: number;
  assignedJurisdiction: string;
  colorHex: string;
}

export type ActionStatus = 'Pending Approval' | 'Approved' | 'Dispatched' | 'In Progress' | 'Completed' | 'Verified' | 'Cancelled';
export type ActionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ActionVerification {
  id: string;
  actionId: string;
  baselineAQI: number;
  baselinePM25: number;
  postInterventionAQI: number;
  postInterventionPM25: number;
  percentageChangeAQI: number;
  percentageChangePM25: number;
  measurementDurationHours: number;
  verificationStatus: 'Verified Improvement' | 'Marginal Change' | 'Inconclusive' | 'Awaiting Data';
  estimatedImpactConfidence: number; // e.g. 88%
  disclaimer: string;
  verifiedAt: string;
  verifiedBy: string;
}

export interface GovAction {
  id: string;
  actionCode: string;
  title: string;
  description: string;
  type: 'Anti-Smog Gun' | 'Industrial Inspection' | 'Traffic Diversion' | 'Waste Burning Fine' | 'Construction Halt' | 'Emergency Mist Sprinkling' | 'Eviction & Sealing';
  priority: ActionPriority;
  status: ActionStatus;
  departmentId: string;
  departmentName: string;
  targetLocation: string;
  targetCoordinates: Coordinates;
  relatedAlertId?: string;
  relatedReportId?: string;
  assignedTo: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  scheduledTime?: string;
  completedAt?: string;
  resourcesDeployed?: string[];
  verification?: ActionVerification;
  notes?: string;
}

export interface HotspotPrediction {
  id: string;
  zoneName: string;
  coordinates: Coordinates;
  currentAQI: number;
  predictedAQIIn3Hours: number;
  predictedAQIIn6Hours: number;
  riskSeverity: SeverityLevel;
  primaryContributingSource: string;
  confidence: number;
  weatherFactor: string;
}

export interface LiveFeedEvent {
  id: string;
  type:
    | 'high_aqi_detected'
    | 'citizen_report'
    | 'field_report'
    | 'action_assigned'
    | 'action_approved'
    | 'action_started'
    | 'action_completed'
    | 'pollution_improvement'
    | 'hotspot_detected'
    | 'prediction_generated';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  severity: SeverityLevel;
  relatedEntityId?: string;
  relatedEntityType?: 'alert' | 'report' | 'action' | 'sensor';
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibilityKm: number;
  pressureHpa: number;
  uvIndex: number;
}

export interface DashboardKPIData {
  totalSensors: {
    value: number;
    onlineCount: number;
    calibratingCount: number;
    offlineCount: number;
  };
  activeAlerts: {
    value: number;
    newCount: number;
    criticalCount: number;
    highCount: number;
  };
  reports24h: {
    value: number;
    pendingCount?: number;
    pendingReviewCount?: number;
    verifiedCount?: number;
    percentageChange24h: number;
  };
  actionsTaken: {
    value: number;
    completedCount: number;
    inProgressCount: number;
    approvedCount: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'alert' | 'action' | 'report' | 'system';
  severity: SeverityLevel;
  linkId?: string;
}
