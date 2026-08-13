import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CasesProvider } from './context/CasesContext';
import { LoaderProvider } from './context/LoaderContext';
import { LocaleProvider } from './i18n/LocaleContext';
import { ThemeProvider } from './theme/ThemeContext';
import { AddCasePage } from './pages/AddCasePage';
import { CalendarPage } from './pages/CalendarPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { CaseHistoryPage } from './pages/CaseHistoryPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage, ProfileOverview, ProfileSettings } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { SearchPage } from './pages/SearchPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';

function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <LoaderProvider>
          <AuthProvider>
            <CasesProvider>
              <Routes>
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-otp" element={<VerifyOtpPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/cases/new" element={<AddCasePage />} />
                    <Route path="/cases/:id/edit" element={<AddCasePage />} />
                    <Route path="/cases/:id/history" element={<CaseHistoryPage />} />
                    <Route path="/cases/:id/detail" element={<CaseDetailPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/profile" element={<ProfilePage />}>
                      <Route index element={<ProfileOverview />} />
                      <Route path="settings" element={<ProfileSettings />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </CasesProvider>
          </AuthProvider>
        </LoaderProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

export default App;
