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
import { InvestigationShell } from './features/investigation-workspace';
import { HomeView } from './features/investigation-workspace/views/HomeView';
import { CaseDetailView } from './features/investigation-workspace/views/CaseDetailView';
import { RelationshipInspectorView } from './features/investigation-workspace/views/RelationshipInspectorView';
import { InvoiceDetailView } from './features/investigation-workspace/views/InvoiceDetailView';
import { PaymentDetailView } from './features/investigation-workspace/views/PaymentDetailView';
import { CreditNoteDetailView } from './features/investigation-workspace/views/CreditNoteDetailView';
import { OutstandingView } from './features/investigation-workspace/views/OutstandingView';
import { ExceptionsView } from './features/investigation-workspace/views/ExceptionsView';
import { SearchView } from './features/investigation-workspace/views/SearchView';
import { DocumentListView } from './features/investigation-workspace/views/DocumentListView';
import { PricingDeskHome, QuoteWorkspace, PricingDeskProvider } from './features/pricing-desk';
import LedgerAccountAdmin from './components/card-recon/LedgerAccountAdmin';
import { useAuth, UserRole } from './hooks/useAuth';
import LoginScreen from './components/auth/LoginScreen';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) {
  const { userRole, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen font-black text-blue-500 animate-pulse">Checking Permissions...</div>;
  if (!userRole || !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen font-black text-blue-500 animate-pulse">Checking Permissions...</div>;
  }
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <BrowserRouter>
      <PricingDeskProvider>
        <Routes>
          <Route path="/count/:sessionId?" element={
            <ProtectedRoute allowedRoles={['Yard Counter', 'Depot Manager']}>
              <CountSession />
            </ProtectedRoute>
          } />
          <Route path="/debtors/:debtorCode/investigate" element={
            <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
              <InvestigationShell />
            </ProtectedRoute>
          }>
            <Route index element={<HomeView />} />
            <Route path="cases/:allocationGroupId" element={<CaseDetailView />} />
            <Route path="relationships/:relationshipId" element={<RelationshipInspectorView />} />
            <Route path="invoices" element={<DocumentListView kind="invoices" />} />
            <Route path="invoices/:doc" element={<InvoiceDetailView />} />
            <Route path="payments" element={<DocumentListView kind="payments" />} />
            <Route path="payments/:doc" element={<PaymentDetailView />} />
            <Route path="credit-notes" element={<DocumentListView kind="creditNotes" />} />
            <Route path="credit-notes/:doc" element={<CreditNoteDetailView />} />
            <Route path="outstanding" element={<OutstandingView />} />
            <Route path="exceptions" element={<ExceptionsView />} />
            <Route path="search" element={<SearchView />} />
          </Route>
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
                  <Route path="/pricing-desk" element={
                    <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                      <PricingDeskHome />
                    </ProtectedRoute>
                  } />
                  <Route path="/pricing-desk/quote/:customerCode?" element={
                    <ProtectedRoute allowedRoles={['Depot Manager', 'Invoice Clerk']}>
                      <QuoteWorkspace />
                    </ProtectedRoute>
                  } />
                  <Route path="/card-recon/ledger-accounts" element={
                    <ProtectedRoute allowedRoles={['Depot Manager']}>
                      <LedgerAccountAdmin />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </PricingDeskProvider>
    </BrowserRouter>
  );
}

export default App;
