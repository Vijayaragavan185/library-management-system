// src/pages/Resources.js
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import ResourcesList from '../components/resources/ResourcesList';
import AddResource from '../components/resources/AddResource';

const Resources = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  
  const handleResourceAdded = () => {
    setRefreshTrigger(prev => !prev);
  };
  
  return (
    <Layout>
      <div className="resources-page">
        <h1>Resources Management</h1>
        
        <div className="content-grid">
          <div className="main-content">
            <ResourcesList onRefresh={refreshTrigger} />
          </div>
          
          <div className="side-content">
            <AddResource onResourceAdded={handleResourceAdded} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resources;