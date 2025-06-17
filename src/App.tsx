import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import IntegrationsList from './pages/IntegrationsList'
import CreateIntegration from './pages/CreateIntegration'

const App: React.FC = () => {

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<IntegrationsList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreateIntegration />} />
      </Routes>
    </Router>
  )
}

export default App
