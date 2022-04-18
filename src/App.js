import React, {useState} from 'react';
import './App.css';
// import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 
import { auth } from './firebase-config'
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
    setCount (count + childData);
  }

  //  Firebase: Error (auth/account-exists-with-different-credential).
  // ngrok http 3000

  async function handleLogout () {
    // setError('');
    try {
      return await auth.signOut ()
      // navigate('/login')
    } catch (error) { console.log (error.message)} //setError(e.message) &&
  }

  function logout () {
    try {
      // return signInWithEmailAndPassword (auth, email, password)
      return auth.signOut ()
    } catch (e) {console.log (e)}
  }


  return (
    <div className="App-continer_">
      <h2  style={{color:'green'}}> Stock compare tool</h2>
      {/* <Container  className='d-flex align-items-left justify-content-left' style={{minHeight: "50vh"}}  > */}
        <div>       
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
        </div>
      {/* </Container> */}
      <label count = {count} />

    </div>

);
}

export default App;
