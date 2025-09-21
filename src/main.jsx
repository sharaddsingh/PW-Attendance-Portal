/**
 * Application Entry Point
 * 
 * This is the main entry point for the PW Attendance Portal React application.
 * It sets up the React root element and renders the main App component with
 * React StrictMode for additional development checks and warnings.
 * 
 * Key Responsibilities:
 * - Initialize React application
 * - Mount the App component to the DOM
 * - Enable React StrictMode for development best practices
 * - Load global CSS styles
 * 
 * @author PW Attendance Portal Team
 * @version 1.0.0
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Global styles including Tailwind CSS

// Create React root and render the application
// React.StrictMode helps identify potential problems in the application
// during development by activating additional checks and warnings
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
