// src/pages/Circulation.js
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import CheckoutForm from '../components/circulation/CheckoutForm';
import ReturnForm from '../components/circulation/ReturnForm';
import TransactionsList from '../components/circulation/TransactionsList';

const Circulation = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  
  const handleTransactionUpdated = () => {
    setRefreshTrigger(prev => !prev);
  };
  
  return (
    <Layout>
      <div className="circulation-page">
        <h1>Circulation Management</h1>
        
        <div className="forms-container">
          <div className="form-section">
            <CheckoutForm onCheckout={handleTransactionUpdated} />
          </div>
          
          <div className="form-section">
            <ReturnForm onReturn={handleTransactionUpdated} />
          </div>
        </div>
        
        <div className="transactions-section">
          <TransactionsList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </Layout>
  );
};

export default Circulation;