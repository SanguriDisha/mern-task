import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const StatisticsDashboard = () => {
  const [month, setMonth] = useState('March');
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/statistics`, {
          params: { month },
        });
        setStatistics(response.data);
        setError('');
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError(error.response?.data?.message || 'Something went wrong');
        setStatistics(null);
      }
    };

    fetchStatistics();
  }, [month]);

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  return (
    <div>
      <h1>Statistics Dashboard</h1>
      <select value={month} onChange={handleMonthChange}>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>

      {/* Statistics Section */}
      <div className="statistics">
        <h2>Statistics for {month}</h2>
        {error && <p className="error">{error}</p>}
        {statistics ? (
          <div>
            <p>Total Sale Amount: {statistics.totalSaleAmount || 0}</p>
            <p>Total Sold Items: {statistics.totalSoldItems || 0}</p>
            <p>Total Not Sold Items: {statistics.totalNotSoldItems || 0}</p>
          </div>
        ) : (
          <p>No statistics available for the selected month.</p>
        )}
      </div>
    </div>
  );
};

export default StatisticsDashboard;