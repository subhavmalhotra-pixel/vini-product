import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AfterHours from './pages/AfterHours'
import LeadActivity from './pages/LeadActivity'
import EmailDigest from './pages/EmailDigest'
import { DEALERS, DEALER_WEEKS } from './data/mockData'

export default function App() {
  const [dealerId, setDealerId] = useState('D001')
  const [weekStart, setWeekStart] = useState('2026-04-27')

  const availableWeeks = DEALER_WEEKS[dealerId] ?? []

  const handleDealerChange = useCallback((id: string) => {
    setDealerId(id)
    const weeks = DEALER_WEEKS[id] ?? []
    // Reset to the most recent week for the new dealer
    setWeekStart(weeks[weeks.length - 1] ?? '2026-04-27')
  }, [])

  return (
    <BrowserRouter>
      <Layout
        dealers={DEALERS}
        selectedDealerId={dealerId}
        weekStart={weekStart}
        onDealerChange={handleDealerChange}
        onWeekChange={setWeekStart}
        availableWeeks={availableWeeks}
      >
        <Routes>
          <Route path="/" element={<Dashboard dealerId={dealerId} weekStart={weekStart} />} />
          <Route path="/after-hours" element={<AfterHours dealerId={dealerId} weekStart={weekStart} />} />
          <Route path="/leads" element={<LeadActivity dealerId={dealerId} weekStart={weekStart} />} />
          <Route path="/email-digest" element={<EmailDigest dealerId={dealerId} weekStart={weekStart} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
