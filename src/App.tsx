import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CSVUpload from './components/csv/CSVUpload';
import CountSession from './components/count/CountSession';
import ReconciliationResults from './components/reconciliation/ReconciliationResults';
import TrendsDashboard from './components/trends/TrendsDashboard';
import DataHub from './components/dashboard/DataHub';
import AuditDashboard from './components/dashboard/AuditDashboard';
import DispatchDashboard from './components/dispatch/DispatchDashboard';
import ReconciliationWorkspace from './components/reconciliation/ReconciliationWorkspace';
import { DebtorListView, DebtorWorkspacePage } from './features/debtor-position-workspace';
import { useAuth, UserRole } from './hooks/useAuth';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) {
  const { userRole, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen font-black text-blue-500 animate-pulse">Checking Permissions...</div>;
  if (!userRole || !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/count/:sessionId?" element={
          <ProtectedRoute allowedRoles={['Yard Counter', 'Depot Manager']}>
            <CountSession />
          </ProtectedRoute>
        } />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={
                  <ProtectedRoute allowedRoles={['Depot Manager']}>
                    <CSVUpload />
                  </ProtectedRoute>
                } />
                <Route path="/results" element={
                  <ProtectedRoute allowedRoles={['Depot Manager']}>
                    <ReconciliationResults />
                  </ProtectedRoute>
                } />
                <Route path="/trends" element={
                  <ProtectedRoute allowedRoles={['Depot Manager']}>
                    <TrendsDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/data-agent" element={
                  <ProtectedRoute allowedRoles={['Depot Manager']}>
                    <DataHub />
                  </ProtectedRoute>
                } />
                <Route path="/audit" element={
                  <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                    <AuditDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dispatch" element={
                  <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                    <DispatchDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/debtors-recon/:accountNo" element={
                  <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                    <ReconciliationWorkspace />
                  </ProtectedRoute>
                } />
                <Route path="/debtors" element={
                  <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                    <DebtorListView />
                  </ProtectedRoute>
                } />
                <Route path="/debtors/:debtorCode" element={
                  <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                    <DebtorWorkspacePage />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

