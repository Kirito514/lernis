import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WalletPage = lazy(() => import("./pages/Wallet"));
const MyCertificates = lazy(() => import("./pages/MyCertificates"));
const Courses = lazy(() => import("./pages/Courses"));
const Profile = lazy(() => import("./pages/Profile"));
const Students = lazy(() => import("./pages/Students"));
const Help = lazy(() => import("./pages/Help"));
const CreateCertificate = lazy(() => import("./pages/CreateCertificate"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const BuyTokens = lazy(() => import("./pages/BuyTokens"));
const CertificateHistory = lazy(() => import("./pages/CertificateHistory"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const DashboardVerification = lazy(() => import("./pages/DashboardVerification"));
const StudentCertificates = lazy(() => import("./pages/StudentCertificates"));
const GiftHistory = lazy(() => import("./pages/GiftHistory"));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/wallet" 
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/marketplace" 
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/buy-tokens" 
              element={
                <ProtectedRoute>
                  <BuyTokens />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/my-certificates" 
              element={
                <ProtectedRoute>
                  <StudentCertificates />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/courses" 
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/students" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/help" 
              element={
                <ProtectedRoute>
                  <Help />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/certificates/create" 
              element={
                <ProtectedRoute>
                  <CreateCertificate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/teachers" 
              element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            {/* Additional routes for organization and admin roles */}
            <Route 
              path="/dashboard/certificates" 
              element={
                <ProtectedRoute>
                  <MyCertificates />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/certificates/templates" 
              element={
                <ProtectedRoute>
                  <CreateCertificate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/certificates/bulk" 
              element={
                <ProtectedRoute>
                  <CreateCertificate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/students/add" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/students/import" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/verification" 
              element={
                <ProtectedRoute>
                  <DashboardVerification />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/verification/log" 
              element={
                <ProtectedRoute>
                  <CertificateHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/organization" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/organization/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/organizations" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/users" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/users/students" 
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/users/teachers" 
              element={
                <ProtectedRoute>
                  <Teachers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/transactions" 
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/certificate-history" 
              element={
                <ProtectedRoute>
                  <CertificateHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/gift-history" 
              element={
                <ProtectedRoute>
                  <GiftHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/verification" 
              element={
                <ProtectedRoute>
                  <VerifyCertificate />
                </ProtectedRoute>
              } 
            />
            {/* Public verification route */}
            <Route 
              path="/verify/:certificateId" 
              element={<VerifyCertificate />} 
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
