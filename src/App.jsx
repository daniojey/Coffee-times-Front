import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import HomePage from './pages/HomePage/HomePage';
import MenuPage from './pages/MenuPage/MenuPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';

import './App.css'



function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <Header/>

          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/menu' element={<MenuPage />} />
            <Route path='/profile' element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
          </Routes>

          <Footer />
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
