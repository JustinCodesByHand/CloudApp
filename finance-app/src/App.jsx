import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Registration from './Components/Registration';
import EnhancedDashboard from './Components/EnhancedDashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import TransactionsTable from './Components/TransactionsTable';

function App() {
  const [aiInsight, setAiInsight] = useState('');

  const fetchAIAdvice = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAiInsight('Please login first');
        return;
      }
      
      const expressUrl = "http://localhost:5000/ai-advice";
      
      const response = await fetch(expressUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiInsight(data.insight);
        console.log('AI Source:', data.source);
      } else {
        setAiInsight('Unable to get AI insights: ' + (data.error || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('AI Advice Error:', error);
      setAiInsight('Connection error. Please check if backend is running.');
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <EnhancedDashboard aiInsight={aiInsight} onGetAdvice={fetchAIAdvice} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsTable />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
