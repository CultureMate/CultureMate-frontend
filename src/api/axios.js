import axios from 'axios'

// All future API modules can import this shared instance.
// CRA forwards /api to the development backend at localhost:8080.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 10000,
})

export default api
