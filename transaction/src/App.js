import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TransactionDashboard from './TransactionDashboard';
import StatisticsDashboard from './StatisticsDashboard';
import BarChart from './BarChart';
import './App.css';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/transaction">Transaction Dashboard</Link>
            </li>
            <li>
              <Link to="/statistics">Statistics Dashboard</Link>
            </li>
            <li>
              <Link to="/barchart">Bar Chart</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/transaction" element={<TransactionDashboard />} />
          <Route path="/statistics" element={<StatisticsDashboard />} />
          <Route path="/barchart" element={<BarChart />} /> {/* New Bar Chart Route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;