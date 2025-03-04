// src/pages/Fines.js
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import FinesList from '../components/fines/FinesList';
import AddFine from '../components/fines/AddFine';

const Fines = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  
  const handleFineAdded = () => {
    setRefreshTrigger(prev => !prev);
  };
  
  return (
    <Layout>
      <div className="fines-page">
        <h1>Fine Management</h1>
        
        <div className="content-grid">
          <div className="main-content">
            <FinesList refreshTrigger={refreshTrigger} />
          </div>
          
          <div className="side-content">
            <AddFine onFineAdded={handleFineAdded} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Fines;