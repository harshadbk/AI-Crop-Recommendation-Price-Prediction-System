import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext.jsx'
import { Layout } from './components/Layout.jsx'
import { HomePage } from './pages/Home.jsx'
import { ChatPage } from './pages/Chat.jsx'
import { HistoryPage } from './pages/History.jsx'
import { LoginPage } from './pages/Login.jsx'
import { ResultPage } from './pages/Result.jsx'
import { SignupPage } from './pages/Signup.jsx'
import { PredictionPage } from './pages/Prediction.jsx'
import { MarketResultPage } from './pages/MarketResult.jsx'
import { AnalyticsPage } from './pages/Analytics.jsx'
import { DashboardPage } from './pages/Dashboard.jsx'
import { ProfilePage } from './pages/Profile.jsx'

// Logged-in farmers land on their personalised "My Farm" dashboard; guests see the advisory form.
function Landing() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <DashboardPage /> : <HomePage />
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/advisory" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/market-prediction" element={<PredictionPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/market-result" element={<MarketResultPage />} />
            <Route path="/results" element={<Navigate to="/result" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}
