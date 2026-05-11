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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/count/:sessionId?" element={<CountSession />} />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<CSVUpload />} />
                <Route path="/results" element={<ReconciliationResults />} />
                <Route path="/trends" element={<TrendsDashboard />} />
                <Route path="/data-agent" element={<DataHub />} />
                <Route path="/audit" element={<AuditDashboard />} />
                <Route path="/dispatch" element={<DispatchDashboard />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

