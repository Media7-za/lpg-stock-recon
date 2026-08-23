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
import { useAuth, UserRole } from './hooks/useAuth';
import LoginScreen from './components/auth/LoginScreen';
import { Navigate } from 'react-router-dom';
import { OrdersModuleLayout } from './components/layout/OrdersModuleLayout';
import VehiclesPage from './pages/fleet/VehiclesPage';
import DriversPage from './pages/fleet/DriversPage';
import RoutesPage from './pages/fleet/RoutesPage';
import ProductsPage from './pages/catalog/ProductsPage';
import CustomersPage from './pages/customers/CustomersPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import EditOrderPage from './pages/orders/EditOrderPage';
import TripsPage from './pages/trips/TripsPage';
import NewTripPage from './pages/trips/NewTripPage';

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
          {/* Orders-Module migration (Phase 4) — deliberately unguarded, no
              ProtectedRoute: "skip auth for now" was an explicit decision for
              these pages specifically. Own layout/nav chrome (OrdersModuleLayout),
              separate from the existing Layout used below. */}
          <Route path="/vehicles" element={<OrdersModuleLayout><VehiclesPage /></OrdersModuleLayout>} />
          <Route path="/drivers" element={<OrdersModuleLayout><DriversPage /></OrdersModuleLayout>} />
          <Route path="/routes" element={<OrdersModuleLayout><RoutesPage /></OrdersModuleLayout>} />
          <Route path="/products" element={<OrdersModuleLayout><ProductsPage /></OrdersModuleLayout>} />
          <Route path="/customers" element={<OrdersModuleLayout><CustomersPage /></OrdersModuleLayout>} />
          {/* /orders (list), /orders/:id (detail), /orders/history deliberately
              NOT mounted yet — deferred to Step 5, see Step 3 report. */}
          <Route path="/orders/new" element={<OrdersModuleLayout><NewOrderPage /></OrdersModuleLayout>} />
          <Route path="/orders/:id/edit" element={<OrdersModuleLayout><EditOrderPage /></OrdersModuleLayout>} />
          {/* /trips/:id (detail) and /trips/:id/edit deliberately NOT mounted
              yet — not built this step, see Step 4 report. TripsPage links to
              them; those links 404 until a follow-up covers them. */}
          <Route path="/trips" element={<OrdersModuleLayout><TripsPage /></OrdersModuleLayout>} />
          <Route path="/trips/new" element={<OrdersModuleLayout><NewTripPage /></OrdersModuleLayout>} />
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
