import React, {useState} from 'react';
import './App.css';
// import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 
import { auth } from './firebaseConfig'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
// import { logout} from './contexts/AuthContext'
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { Container } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Alert } from 'react-bootstrap'
import { Form } from 'react-bootstrap'


import Signup from './auth/Signup';
import Dashboard from './auth/Dashboard'
import Login from './auth/Login';
import ForgotPassword from './auth/ForgotPassword';
import UpdateProfile from './auth/UpdateProfile';




function App() {
  const [count, setCount] = useState (0);
  // const { currentUser, logout } = useAuth();
  // const navigate = useNavigate();

  const refreshCallBack = (childData) => {
    setCount (count + 1);
  }

  //  Firebase: Error (auth/account-exists-with-different-credential).
  // ngrok http 3000

  return (
    <div className="App-continer">

      <Container  className='d-flex align-items-left justify-content-left' style={{minHeight: "50vh", minWidth: "100%"}}  >
        <div> 
        <h2  style={{color:'green'}}> Stock compare tool</h2>      
          <AuthProvider>

                   {/* <hr/>  */}
            <Router>
              <Routes>
                <Route exact path="/" element={<BasicTable refreshCallBack = {refreshCallBack} />}/>
                <Route path ="/dashBoard"  element={<Dashboard />}/>
                      {/* <Route path="/" element={<Dashboard/>}   /> */}
                <Route path="/signup" element={<Signup/> } />
                <Route path="/login" element={<Login/> }/>
                <Route path="/forgotPassword" element={<ForgotPassword />}/>
                <Route path="/update-profile" element={<UpdateProfile  />}/>
              </Routes>
            </Router>

          </AuthProvider>
          {/* <div>{count}</div> */}
        </div>
      </Container>
      <label count = {count} />

    </div>

);
}

export default App;
