// src/pages/Categories.js
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import CategoriesList from '../components/categories/CategoriesList';
import AddCategory from '../components/categories/AddCategory';

const Categories = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  
  const handleCategoryAdded = () => {
    setRefreshTrigger(prev => !prev);
  };
  
  return (
    <Layout>
      <div className="categories-page">
        <h1>Resource Categories</h1>
        
        <div className="content-grid">
          <div className="main-content">
            <CategoriesList onRefresh={refreshTrigger} />
          </div>
          
          <div className="side-content">
            <AddCategory onCategoryAdded={handleCategoryAdded} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;