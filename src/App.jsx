import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
// import HomePage from './pages/HomePage/HomePage';
const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'))
// import MenuPage from './pages/MenuPage/MenuPage';
const MenuPage = React.lazy(() => import('./pages/MenuPage/MenuPage'))
// import SearchReservationPage from './pages/SearchReservationPage/SearchReservationPage';
const SearchReservationPage = React.lazy(() => import('./pages/SearchReservationPage/SearchReservationPage'))
// import MapPage from './pages/MapPage/MapPage';
const MapPage = React.lazy(() => import('./pages/MapPage/MapPage'))
// import ProfilePage from './pages/ProfilePage/ProfilePage';
const ProfilePage = React.lazy(() => import('./pages/ProfilePage/ProfilePage'))
import ProfileHistoryPage from './pages/ProfileHistoryPage/ProfileHistoryPage';
// const ProfileHistoryPage = React.lazy(() => import('./pages/ProfileHistoryPage/ProfileHistoryPage'))
// import CreateReservationPage from './pages/CreateReservationPage/CreateReservationPage';
const CreateReservationPage = React.lazy(() => import('./pages/CreateReservationPage/CreateReservationPage'))
// import LoginPage from './pages/LoginPage/LoginPage';
const LoginPage = React.lazy(() => import('./pages/LoginPage/LoginPage'))
// import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
const RegistrationPage = React.lazy(() => import('./pages/RegistrationPage/RegistrationPage'))

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
            <Route path='/search-reservations' element={<SearchReservationPage />} />
            <Route path='/map' element={<MapPage />} />
            <Route path='/create-reservation' element={<CreateReservationPage />}></Route>


            <Route path='/profile' element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path='/reservation-history' element={
              <ProtectedRoute>
                <ProfileHistoryPage />
              </ProtectedRoute>
            } />

            <Route path='/login' element={<LoginPage />} />
            <Route path='/registration' element={<RegistrationPage />} />
          </Routes>

          <Footer />
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
