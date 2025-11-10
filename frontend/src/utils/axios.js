import axios from "axios";

// Configure axios to include credentials (cookies) in all requests
axios.defaults.withCredentials = true;

// Set base URL for API calls
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";

export default axios;
