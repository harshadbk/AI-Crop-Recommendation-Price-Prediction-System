import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext.jsx'
import { Layout } from './components/Layout.jsx'
import { HomePage } from './pages/Home.jsx'
import { ChatPage } from './pages/Chat.jsx'
import { HistoryPage } from './pages/History.jsx'
import { LoginPage } from './pages/Login.jsx'
import { ResultPage } from './pages/Result.jsx'
import { SignupPage } from './pages/Signup.jsx'
import { PredictionPage } from './pages/Prediction.jsx'
import { MarketResultPage } from './pages/MarketResult.jsx'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
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
