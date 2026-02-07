import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Set global base URL for axios
// If BASE_PATH is set (e.g. /trello), API calls like /api/files will become /trello/api/files
const basePath = window.BASE_PATH || '/';
// Ensure basePath doesn't end with slash if it's not just '/' to avoid double slashes with api paths
axios.defaults.baseURL = basePath === '/' ? '' : basePath;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
