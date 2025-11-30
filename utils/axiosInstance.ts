import axios from "axios";

// Determine base URL based on environment
const getBaseURL = () => {
  if (__DEV__) {
    // Development - using your local IP
    return "http://192.168.100.8:5000/api";
  } else {
    // Production - using your deployed server
    return "https://studybuddy-backend-vhyz.onrender.com/api";
  }
};

const client = axios.create({
  baseURL: getBaseURL(), // Use the function to get the correct URL
  timeout: 15000, // Add timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for debugging
client.interceptors.request.use(
  (config) => {
    console.log("🚀 Making request to:", config.url);
    return config;
  },
  (error) => {
    console.log("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
client.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.status);
    return response;
  },
  (error) => {
    console.log("❌ Response error:", error.message);
    return Promise.reject(error);
  }
);

export default client;
