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
import CookieConsent from "react-cookie-consent"
// import Contact from './auth/Contact'

import {getDateSec} from './table/Date'
import About from './About'
import Tutorials from './Tutorials'
import LogFlags from './LogFlags'

function App() {
  const [count, setCount] = useState (0);
  // const { currentUser, logout } = useAuth();
  // const navigate = useNavigate();
  const nowStr = getDateSec()
  console.log(nowStr  + '  %cstock compare start', 'background: #fff; color: #22ef11');


  const refreshCallBack = (childData) => {
    setCount (count + 1);
  }

  //  Firebase: Error (auth/account-exists-with-different-credential).
  // ngrok http 3000
  // <Route path="/contact" element={<Contact  />}/>

  return (
    <div className="App-continer">
        {/* <CookieConsent debug={true}> Site uses localStorage, (equivalent to cookies)</CookieConsent> */}
      <Container  className='d-flex align-items-left justify-content-left' style={{minHeight: "50vh", minWidth: "100%"}}  >
        <div> 
        <h2  style={{color:'green'}}> Stocks analyse & compare</h2> 
        <AuthProvider>

            <div style={{display:'flex'}}>
              {/* <About/>  &nbsp;   &nbsp; 
              <Tutorials/> */}
            </div>
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

                <Route path="/tutorials" element={<Tutorials  />}/>
                <Route path="/about" element={<About  />}/>
                <Route path="/logFlags" element={<LogFlags  />}/>

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
