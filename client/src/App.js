import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home'; // Change to your Home component path
import Login from './components/Login';
import UserProfile from './components/UserProfile';
//import Dashboard from './components/Dashboard';
import ReadingPlanner from './components/ReadingPlanner';
import Discoveries from './components/Discoveries';
import Register from './components/Register'
import UserReviews from './components/Reviews';


function App() {
  const isAuthenticated = Boolean(localStorage.getItem('jwt_token')); // Replace with actual auth check

  return (
    <Router>
      <Navbar /> 
      <Routes>
        <Route path="/discoveries" component={Discoveries} /> 
        <Route path="/reading-planner" element={<ReadingPlanner />} /> 
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} /> */}
        <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
        <Route path="/reviews" element={<UserReviews />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;




// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import LandingPage from './components/LandingPage';
// import Login from './components/Login';
// import Register from './components/Register';
// import Dashboard from './components/Dashboard';
// import UserProfile from './components/UserProfile';
// import PrivateRoute from './components/PrivateRoute'; // Ensure this file exists and path is correct

// function App() {
//   const isAuthenticated = Boolean(localStorage.getItem('jwt_token')); // Replace with actual auth check

//   return (
//     <Router>
//       {isAuthenticated && <Navbar />} {/* Render Navbar only if authenticated */}
//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
//         <Route path="/profile" element={<PrivateRoute element={<UserProfile />} />} />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
