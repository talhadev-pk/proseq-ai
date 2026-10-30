import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { MarketingLayout } from '@/layouts/MarketingLayout'
import { AppLayout } from '@/layouts/AppLayout'
import HomePage from '@/pages/marketing/HomePage'
import FeaturesPage from '@/pages/marketing/FeaturesPage'
import TemplatesPage from '@/pages/marketing/TemplatesPage'
import PricingPage from '@/pages/marketing/PricingPage'
import AboutPage from '@/pages/marketing/AboutPage'
import ContactPage from '@/pages/marketing/ContactPage'
import NotFoundPage from '@/pages/marketing/NotFoundPage'
import OverviewPage from '@/pages/app/OverviewPage'
import WriterPage from '@/pages/app/WriterPage'
import DocumentsPage from '@/pages/app/DocumentsPage'
import AppTemplatesPage from '@/pages/app/AppTemplatesPage'
import BrandVoicePage from '@/pages/app/BrandVoicePage'
import PlannerPage from '@/pages/app/PlannerPage'
import HistoryPage from '@/pages/app/HistoryPage'
import SettingsPage from '@/pages/app/SettingsPage'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="writer" element={<WriterPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="templates" element={<AppTemplatesPage />} />
            <Route path="brand-voice" element={<BrandVoicePage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="/app/:rest" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}
