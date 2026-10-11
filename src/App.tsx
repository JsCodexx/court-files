import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { SubscriptionGate } from './components/SubscriptionGate';
import { SubscriptionBillingGuard } from './components/SubscriptionBillingGuard';
import { SubscriptionRenewalDialog } from './components/SubscriptionRenewalDialog';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { CasesProvider } from './context/CasesContext';
import { LoaderProvider } from './context/LoaderContext';
import { LocaleProvider } from './i18n/LocaleContext';
import { ThemeProvider } from './theme/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { AddCasePage } from './pages/AddCasePage';
import { CalendarPage } from './pages/CalendarPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { CaseHistoryPage } from './pages/CaseHistoryPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForceChangePasswordPage } from './pages/ForceChangePasswordPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LandingPage } from './pages/LandingPage';
import { GuestCheckoutPage } from './pages/GuestCheckoutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import {
  AboutPage,
  ContactPage,
  PrivacyPage,
  RefundPolicyPage,
  TermsPage,
} from './pages/LegalPages';
import { LoginPage } from './pages/LoginPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { PlansPage } from './pages/PlansPage';
import { ProfilePage, ProfileOverview, ProfileSettings } from './pages/ProfilePage';
import { PublicPricingPage } from './pages/PublicPricingPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SearchPage } from './pages/SearchPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <LoaderProvider>
          <ToastProvider>
            <PwaUpdatePrompt />
            <AuthProvider>
            <SubscriptionProvider>
            <SubscriptionRenewalDialog />
            <CasesProvider>
              <Routes>
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-otp" element={<VerifyOtpPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route
                    path="/change-password-required"
                    element={<ForceChangePasswordPage />}
                  />
                  <Route element={<AppLayout />}>
                    <Route element={<SubscriptionBillingGuard />}>
                    <Route path="/plans" element={<PlansPage />} />
                    <Route path="/payments" element={<PaymentsPage />} />
                    <Route path="/profile" element={<ProfilePage />}>
                      <Route index element={<ProfileOverview />} />
                      <Route path="settings" element={<ProfileSettings />} />
                    </Route>
                    <Route element={<SubscriptionGate />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/cases/new" element={<AddCasePage />} />
                      <Route path="/cases/:id/edit" element={<AddCasePage />} />
                      <Route path="/cases/:id/history" element={<CaseHistoryPage />} />
                      <Route path="/cases/:id/detail" element={<CaseDetailPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/search" element={<SearchPage />} />
                    </Route>
                    </Route>
                  </Route>
                </Route>

                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pricing" element={<PublicPricingPage />} />
                <Route path="/checkout" element={<GuestCheckoutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CasesProvider>
            </SubscriptionProvider>
          </AuthProvider>
          </ToastProvider>
        </LoaderProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;
