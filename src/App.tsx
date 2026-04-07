import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import CSVUpload from './components/csv/CSVUpload';
import CountSession from './components/count/CountSession';
import ReconciliationResults from './components/reconciliation/ReconciliationResults';
import TrendsDashboard from './components/trends/TrendsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<CSVUpload />} />
          <Route path="/count/:sessionId?" element={<CountSession />} />
          <Route path="/results" element={<ReconciliationResults />} />
          <Route path="/trends" element={<TrendsDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

