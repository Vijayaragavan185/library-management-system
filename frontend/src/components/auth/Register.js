// // src/components/auth/Register.js
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../../services/api';

// const Register = () => {
//   const [formData, setFormData] = useState({
//     student_id: '',
//     name: '',
//     email: '',
//     department: '',
//     username: '',
//     password: '',
//     confirmPassword: ''
//   });
  
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);
    
//     // Validate data
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }
    
//     try {
//       const dataToSend = {
//         student_id: formData.student_id,
//         name: formData.name,
//         email: formData.email,
//         department: formData.department,
//         username: formData.username,
//         password: formData.password
//       };
      
//       const response = await api.post('/auth/register', dataToSend);
//       setSuccess(response.data.message);
//       setFormData({
//         student_id: '',
//         name: '',
//         email: '',
//         department: '',
//         username: '',
//         password: '',
//         confirmPassword: ''
//       });
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="register-container">
//       <div className="register-form">
//         <h2>Student Registration</h2>
        
//         {error && <div className="error-message">{error}</div>}
//         {success && <div className="success-message">{success}</div>}
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="student_id">Student ID</label>
//             <input 
//               type="text" 
//               id="student_id"
//               name="student_id"
//               value={formData.student_id}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="name">Full Name</label>
//             <input 
//               type="text" 
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input 
//               type="email" 
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="department">Department</label>
//             <input 
//               type="text" 
//               id="department"
//               name="department"
//               value={formData.department}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="username">Username</label>
//             <input 
//               type="text" 
//               id="username"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input 
//               type="password" 
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength="6"
//             />
//           </div>
          
//           <div className="form-group">
//             <label htmlFor="confirmPassword">Confirm Password</label>
//             <input 
//               type="password" 
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               minLength="6"
//             />
//           </div>
          
//           <button 
//             type="submit" 
//             className="register-button"
//             disabled={loading}
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
          
//           <div className="auth-links">
//             Already have an account? <Link to="/login">Login here</Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;
// src/components/auth/Register.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: '',
    phone: '', // Add phone field
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  // Add field-specific errors object
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear specific error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Special validation for phone numbers (numbers only)
    if (name === 'phone' && value !== '' && !/^\d*$/.test(value)) {
      return; // Don't update state if non-numeric
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add comprehensive form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Student ID validation (alphanumeric, uppercase)
    if (!/^[A-Z0-9]+$/.test(formData.student_id)) {
      newErrors.student_id = 'Student ID must contain only uppercase letters and numbers';
    }
    
    // Name validation (letters, spaces, and hyphens only)
    if (!/^[A-Za-z\s-]+$/.test(formData.name)) {
      newErrors.name = 'Name must contain only letters, spaces, and hyphens';
    }
    
    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation (numbers only, minimum 10 digits)
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    }
    
    // Department validation 
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }
    
    // Username validation (alphanumeric, 5-20 chars)
    if (!/^[a-zA-Z0-9]{5,20}$/.test(formData.username)) {
      newErrors.username = 'Username must be 5-20 alphanumeric characters';
    }
    
    // Password validation (8+ chars, with number and special char)
    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one letter, one number, and one special character';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Use enhanced validation
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await api.post('/auth/register', dataToSend);
      setSuccess(response.data.message);
      
      // Reset form on success
      setFormData({
        student_id: '',
        name: '',
        email: '',
        department: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Student Registration</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
            <input 
              type="text" 
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
            />
            {errors.student_id && <div className="field-error">{errors.student_id}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Numbers only"
            />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="department">Department</label>
            {/* Replace input with select for better validation */}
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Business">Business</option>
            </select>
            {errors.department && <div className="field-error">{errors.department}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          </div>
          
          <button 
            type="submit" 
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
          
          <div className="auth-links">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
