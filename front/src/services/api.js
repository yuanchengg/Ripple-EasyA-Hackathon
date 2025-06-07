import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "An error occurred";
    console.error("API Error:", {
      message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    // You can add global error handling here if needed
    // For example, redirect to login on 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// =============================================================================
// FARMERS API
// =============================================================================

// Your existing farmer methods
export const getFarmers = () => api.get("/farmers");
export const createFarmer = (data) => api.post("/farmers", data);
export const updateFarmer = (id, data) => api.put(`/farmers/${id}`, data);
export const deleteFarmer = (id) => api.delete(`/farmers/${id}`);

// Additional farmer methods for enhanced functionality
export const getFarmer = async (id) => {
  try {
    console.log('API: Fetching farmer with ID:', id);
    const response = await api.get(`/farmers/${id}`);
    console.log('API: Farmer response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  } catch (error) {
    console.error('API: Error fetching farmer:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getFarmerEscrows = async (id) => {
  try {
    console.log('API: Fetching escrows for farmer ID:', id);
    const response = await api.get(`/farmers/${id}/escrows`);
    console.log('API: Escrows response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  } catch (error) {
    console.error('API: Error fetching farmer escrows:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getFarmerStats = (id) => api.get(`/farmers/${id}/stats`);
export const searchFarmers = (query) =>
  api.get(`/farmers/search?q=${encodeURIComponent(query)}`);

// =============================================================================
// ESCROWS API
// =============================================================================

// Your existing escrow methods
export const getEscrows = () => api.get("/escrows");
export const createEscrow = (data) => api.post("/escrows", data);
export const verifyEscrow = (id, data) =>
  api.post(`/escrows/${id}/verify`, data);
export const cancelEscrow = (id) => api.post(`/escrows/${id}/cancel`);

// Additional escrow methods for enhanced functionality
export const getEscrow = (id) => api.get(`/escrows/${id}`);
export const updateEscrow = (id, data) => api.put(`/escrows/${id}`, data);
export const releaseEscrow = (id, data) =>
  api.post(`/escrows/${id}/release`, data);
export const getEscrowsByStatus = (status) =>
  api.get(`/escrows?status=${status}`);
export const getEscrowsByPractice = (practiceType) =>
  api.get(`/escrows?practice_type=${encodeURIComponent(practiceType)}`);
export const getExpiredEscrows = () => api.get("/escrows/expired");
export const getPendingEscrows = () => api.get("/escrows/pending");

// =============================================================================
// VERIFICATION LOGS API
// =============================================================================

// Your existing verification methods
export const getVerificationLogs = () => api.get("/verification-logs");
export const getVerificationLogsByEscrow = (escrowId) =>
  api.get(`/verification-logs/escrow/${escrowId}`);

// Additional verification methods
export const createVerificationLog = (data) =>
  api.post("/verification-logs", data);
export const getVerificationLog = (id) => api.get(`/verification-logs/${id}`);

// =============================================================================
// DASHBOARD & ANALYTICS API
// =============================================================================

export const getDashboardStats = () => api.get("/dashboard/stats");
export const getRecentActivity = (limit = 10) =>
  api.get(`/dashboard/activity?limit=${limit}`);
export const getFarmingPracticesStats = () => api.get("/dashboard/practices");
export const getLocationStats = () => api.get("/dashboard/locations");

// =============================================================================
// SATELLITE & VERIFICATION API
// =============================================================================

export const uploadSatelliteImage = (escrowId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("escrowId", escrowId);

  return api.post("/satellite/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getSatelliteImages = (escrowId) =>
  api.get(`/satellite/escrow/${escrowId}`);
export const analyzeSatelliteImage = (imageId) =>
  api.post(`/satellite/${imageId}/analyze`);

// =============================================================================
// NOTIFICATIONS API
// =============================================================================

export const getNotifications = (farmerId) =>
  api.get(`/notifications/${farmerId}`);
export const markNotificationRead = (notificationId) =>
  api.put(`/notifications/${notificationId}/read`);
export const createNotification = (data) => api.post("/notifications", data);

// =============================================================================
// PRACTICE TYPES API (if you implement the enhanced schema)
// =============================================================================

export const getPracticeTypes = () => api.get("/practice-types");
export const createPracticeType = (data) => api.post("/practice-types", data);
export const updatePracticeType = (id, data) =>
  api.put(`/practice-types/${id}`, data);
export const deletePracticeType = (id) => api.delete(`/practice-types/${id}`);

// =============================================================================
// CARBON CREDITS API (if you implement the enhanced schema)
// =============================================================================

export const getCarbonCredits = () => api.get("/carbon-credits");
export const getFarmerCarbonCredits = (farmerId) =>
  api.get(`/carbon-credits/farmer/${farmerId}`);
export const createCarbonCredit = (data) => api.post("/carbon-credits", data);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Generic API call wrapper with error handling
export const apiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args);
    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error.response?.data?.error || error.message || "An error occurred",
    };
  }
};

// Batch API calls
export const batchApiCalls = async (apiCalls) => {
  try {
    const responses = await Promise.allSettled(apiCalls);
    return responses.map((response, index) => ({
      index,
      success: response.status === "fulfilled",
      data: response.status === "fulfilled" ? response.value.data : null,
      error: response.status === "rejected" ? response.reason.message : null,
    }));
  } catch (error) {
    console.error("Batch API call error:", error);
    throw error;
  }
};

// =============================================================================
// ENHANCED QUERY BUILDERS
// =============================================================================

// Build query string from object
const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  });
  return queryParams.toString();
};

// Advanced escrow filtering
export const getEscrowsFiltered = (filters = {}) => {
  const queryString = buildQueryString(filters);
  return api.get(`/escrows${queryString ? `?${queryString}` : ""}`);
};

// Advanced farmer filtering
export const getFarmersFiltered = (filters = {}) => {
  const queryString = buildQueryString(filters);
  return api.get(`/farmers${queryString ? `?${queryString}` : ""}`);
};

// =============================================================================
// WEBSOCKET CONNECTION (for real-time updates)
// =============================================================================

export const createWebSocketConnection = (url = "ws://localhost:3001") => {
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("WebSocket disconnected");
  };

  return ws;
};

// =============================================================================
// EXPORT DEFAULT API INSTANCE
// =============================================================================

export default api;
