export type Language = 'en' | 'hi';

export interface Translations {
  // Common
  back: string;
  save: string;
  cancel: string;
  logOut: string;
  logOutConfirm: string;
  logOutMessage: string;
  loading: string;
  noData: string;

  // Tab labels
  tabHome: string;
  tabMap: string;
  tabAlerts: string;
  tabProfile: string;

  // Profile Screen
  profile: string;
  editProfile: string;
  accountInformation: string;
  badgesAchievements: string;
  appPreferences: string;
  notifications: string;
  locationServices: string;
  darkMode: string;
  language: string;
  myReports: string;
  trackReports: string;
  healthSafety: string;
  healthSafetyDesc: string;
  settings: string;
  settingsDesc: string;
  noReports: string;
  communityImpact: string;
  reportsShared: string;
  locationsMonitored: string;
  communityActions: string;
  ecoEnthusiast: string;
  userSubtitle: string;
  india: string;
  changePhoto: string;
  removePhoto: string;

  // Account Info Screen
  displayName: string;
  email: string;
  memberSince: string;

  // Badges Screen
  badgesSubtitle: string;
  reportPro: string;
  reportProDesc: string;
  communityAlly: string;
  communityAllyDesc: string;
  sentinelScout: string;
  sentinelScoutDesc: string;
  level: string;

  // Settings Screen
  account: string;
  personalInformation: string;
  changePassword: string;
  twoFactorAuth: string;
  privacySecurity: string;
  appSettings: string;
  units: string;
  support: string;
  helpSupport: string;
  aboutApp: string;
  aboutText: string;
  changePasswordMsg: string;
  twoFactorMsg: string;
  privacyMsg: string;

  // Alerts Screen
  alerts: string;
  all: string;
  airQuality: string;
  health: string;
  reports: string;
  noAlerts: string;

  // Home Screen
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  currentAqi: string;
  aqiGood: string;
  aqiModerate: string;
  aqiUnhealthy: string;
  aqiHazardous: string;
  nearbyHotspots: string;
  recentReports: string;
  submitReport: string;
  weather: string;
  humidity: string;
  wind: string;
  visibility: string;

  // Map Screen
  map: string;
  hotspots: string;
  filter: string;

  // Health & Safety
  tipsTitle: string;
}

const en: Translations = {
  // Common
  back: 'Back',
  save: 'Save',
  cancel: 'Cancel',
  logOut: 'Log Out',
  logOutConfirm: 'Log Out',
  logOutMessage: 'Are you sure you want to log out?',
  loading: 'Loading...',
  noData: 'No data available.',

  // Tabs
  tabHome: 'Home',
  tabMap: 'Map',
  tabAlerts: 'Alerts',
  tabProfile: 'Profile',

  // Profile
  profile: 'Profile',
  editProfile: 'Edit Profile',
  accountInformation: 'Account Information',
  badgesAchievements: 'Badges & Achievements',
  appPreferences: 'App Preferences',
  notifications: 'Notifications',
  locationServices: 'Location Services',
  darkMode: 'Dark Mode',
  language: 'Language',
  myReports: 'My Reports',
  trackReports: 'Track your submitted reports',
  healthSafety: 'Health & Safety',
  healthSafetyDesc: 'Tips for cleaner air and better health',
  settings: 'Settings',
  settingsDesc: 'Account, privacy & more',
  noReports: "You haven't submitted any reports yet.",
  communityImpact: 'Community Impact',
  reportsShared: 'Reports Shared',
  locationsMonitored: 'Locations Monitored',
  communityActions: 'Community Actions',
  ecoEnthusiast: 'Eco Enthusiast',
  userSubtitle: 'AirSentinel User',
  india: 'India',
  changePhoto: 'Change Photo',
  removePhoto: 'Remove Photo',

  // Account Info
  displayName: 'Display Name',
  email: 'Email',
  memberSince: 'Member Since',

  // Badges
  badgesSubtitle: 'Earn badges by contributing to cleaner air in your community',
  reportPro: 'Report Pro',
  reportProDesc: 'Submitted 10+ reports',
  communityAlly: 'Community Ally',
  communityAllyDesc: 'Helped 5 community actions',
  sentinelScout: 'Sentinel Scout',
  sentinelScoutDesc: 'Monitored 3 locations',
  level: 'Level',

  // Settings
  account: 'Account',
  personalInformation: 'Personal Information',
  changePassword: 'Change Password',
  twoFactorAuth: 'Two-Factor Authentication',
  privacySecurity: 'Privacy & Security',
  appSettings: 'App Settings',
  units: 'Units',
  support: 'Support',
  helpSupport: 'Help & Support',
  aboutApp: 'About AirSentinel',
  aboutText: 'AirSentinel v1.0\nBuilt to make cleaner air accessible for everyone.',
  changePasswordMsg: 'A password change link will be sent to your email.',
  twoFactorMsg: 'Two-Factor Authentication coming soon.',
  privacyMsg: 'Privacy & Security settings coming soon.',

  // Alerts
  alerts: 'Alerts',
  all: 'All',
  airQuality: 'Air Quality',
  health: 'Health',
  reports: 'Reports',
  noAlerts: 'No alerts right now.',

  // Home
  goodMorning: 'Good Morning',
  goodAfternoon: 'Good Afternoon',
  goodEvening: 'Good Evening',
  currentAqi: 'Current AQI',
  aqiGood: 'Good',
  aqiModerate: 'Moderate',
  aqiUnhealthy: 'Unhealthy',
  aqiHazardous: 'Hazardous',
  nearbyHotspots: 'Nearby Hotspots',
  recentReports: 'Recent Reports',
  submitReport: 'Submit Report',
  weather: 'Weather',
  humidity: 'Humidity',
  wind: 'Wind',
  visibility: 'Visibility',

  // Map
  map: 'Map',
  hotspots: 'Hotspots',
  filter: 'Filter',

  // Health
  tipsTitle: 'Health & Safety Tips',
};

const hi: Translations = {
  // Common
  back: 'वापस',
  save: 'सहेजें',
  cancel: 'रद्द करें',
  logOut: 'लॉग आउट',
  logOutConfirm: 'लॉग आउट',
  logOutMessage: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
  loading: 'लोड हो रहा है...',
  noData: 'कोई डेटा उपलब्ध नहीं।',

  // Tabs
  tabHome: 'होम',
  tabMap: 'मानचित्र',
  tabAlerts: 'अलर्ट',
  tabProfile: 'प्रोफ़ाइल',

  // Profile
  profile: 'प्रोफ़ाइल',
  editProfile: 'प्रोफ़ाइल संपादित करें',
  accountInformation: 'खाता जानकारी',
  badgesAchievements: 'बैज और उपलब्धियाँ',
  appPreferences: 'ऐप सेटिंग्स',
  notifications: 'सूचनाएं',
  locationServices: 'स्थान सेवाएं',
  darkMode: 'डार्क मोड',
  language: 'भाषा',
  myReports: 'मेरी रिपोर्ट',
  trackReports: 'अपनी जमा रिपोर्ट ट्रैक करें',
  healthSafety: 'स्वास्थ्य और सुरक्षा',
  healthSafetyDesc: 'स्वच्छ हवा और बेहतर स्वास्थ्य के टिप्स',
  settings: 'सेटिंग्स',
  settingsDesc: 'खाता, गोपनीयता और अधिक',
  noReports: 'आपने अभी तक कोई रिपोर्ट जमा नहीं की।',
  communityImpact: 'सामुदायिक प्रभाव',
  reportsShared: 'रिपोर्ट शेयर की',
  locationsMonitored: 'स्थान निगरानी',
  communityActions: 'सामुदायिक कार्य',
  ecoEnthusiast: 'पर्यावरण प्रेमी',
  userSubtitle: 'एयरसेंटिनल उपयोगकर्ता',
  india: 'भारत',
  changePhoto: 'फोटो बदलें',
  removePhoto: 'फोटो हटाएं',

  // Account Info
  displayName: 'प्रदर्शन नाम',
  email: 'ईमेल',
  memberSince: 'सदस्य कब से',

  // Badges
  badgesSubtitle: 'अपने समुदाय में स्वच्छ हवा के लिए योगदान देकर बैज अर्जित करें',
  reportPro: 'रिपोर्ट प्रो',
  reportProDesc: '10+ रिपोर्ट जमा की',
  communityAlly: 'सामुदायिक साथी',
  communityAllyDesc: '5 सामुदायिक कार्यों में मदद की',
  sentinelScout: 'सेंटिनल स्काउट',
  sentinelScoutDesc: '3 स्थानों की निगरानी की',
  level: 'स्तर',

  // Settings
  account: 'खाता',
  personalInformation: 'व्यक्तिगत जानकारी',
  changePassword: 'पासवर्ड बदलें',
  twoFactorAuth: 'दो-कारक प्रमाणीकरण',
  privacySecurity: 'गोपनीयता और सुरक्षा',
  appSettings: 'ऐप सेटिंग्स',
  units: 'इकाइयाँ',
  support: 'सहायता',
  helpSupport: 'मदद और सहायता',
  aboutApp: 'एयरसेंटिनल के बारे में',
  aboutText: 'एयरसेंटिनल v1.0\nहर किसी के लिए स्वच्छ हवा सुलभ बनाने के लिए बनाया गया।',
  changePasswordMsg: 'पासवर्ड परिवर्तन लिंक आपके ईमेल पर भेजा जाएगा।',
  twoFactorMsg: 'दो-कारक प्रमाणीकरण जल्द आ रहा है।',
  privacyMsg: 'गोपनीयता और सुरक्षा सेटिंग्स जल्द आ रही हैं।',

  // Alerts
  alerts: 'अलर्ट',
  all: 'सभी',
  airQuality: 'वायु गुणवत्ता',
  health: 'स्वास्थ्य',
  reports: 'रिपोर्ट',
  noAlerts: 'अभी कोई अलर्ट नहीं।',

  // Home
  goodMorning: 'सुप्रभात',
  goodAfternoon: 'नमस्कार',
  goodEvening: 'शुभ संध्या',
  currentAqi: 'वर्तमान AQI',
  aqiGood: 'अच्छा',
  aqiModerate: 'मध्यम',
  aqiUnhealthy: 'अस्वस्थ',
  aqiHazardous: 'खतरनाक',
  nearbyHotspots: 'नज़दीकी हॉटस्पॉट',
  recentReports: 'हाल की रिपोर्ट',
  submitReport: 'रिपोर्ट दर्ज करें',
  weather: 'मौसम',
  humidity: 'आर्द्रता',
  wind: 'हवा',
  visibility: 'दृश्यता',

  // Map
  map: 'मानचित्र',
  hotspots: 'हॉटस्पॉट',
  filter: 'फ़िल्टर',

  // Health
  tipsTitle: 'स्वास्थ्य और सुरक्षा सुझाव',
};

export const translations: Record<Language, Translations> = { en, hi };
