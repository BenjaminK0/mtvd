import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import react from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/pages/Home';
import CalendarPage from './components/pages/CalendarPage';
import DeviceLogsPage from './components/pages/DeviceLogsPage';
import ResearchSpotlightPage from './components/pages/ResearchSpotlightPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/device-log" element={<DeviceLogsPage />}/>
        <Route path="/research-spotlight" element={<ResearchSpotlightPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App
