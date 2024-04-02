import React, {useState, Suspense, lazy} from 'react';
import './App.css';
// import StockTable from './Stock-table';

import { auth } from './firebaseConfig'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
// import { logout} from './contexts/AuthContext'
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { Container } from 'react-bootstrap'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Alert } from 'react-bootstrap'
import { Form } from 'react-bootstrap'
import {getDateSec} from './table/Date'
import CookieConsent from "react-cookie-consent"
import LogFlags from './LogFlags'
import About from './About'
import Tutorials from './Tutorials'
import {TargetPrice} from './table/TargetPrice'
import Contact from './auth/Contact'

// import {BasicTable} from './table/BasicTable' 
const BasicTable  = lazy(() => import ( './table/BasicTable'));

const Signup = lazy(() => import ('./auth/Signup'));
const Dashboard = lazy(() => import ('./auth/Dashboard'));
const Login = lazy(() => import ('./auth/Login'));
const ForgotPassword  = lazy(() => import ('./auth/ForgotPassword'));
const UpdateProfile = lazy(() => import ('./auth/UpdateProfile'));
const Manual = lazy(() => import ('./manual/Manual'))



const checkList = ["hiddenCols","drop", 'drop_', 'peak2Peak', 'holdings', "firebase", "verify_1", "splits",
"xyValue", "chart", 'chart1', 'alpha','api', "aux","date","spikes","month","target","gain","backEnd"];


function App() {
  const [count, setCount] = useState (0);
  const [logFlags, setLogFlags] = useState([]);

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
    <Suspense fallback={<div>Loading ... (from App) </div>}>
    <div className="App-continer">
        {/* <CookieConsent debug={true}> Site uses localStorage, (equivalent to cookies)</CookieConsent> */}
      <Container  className='d-flex align-items-left justify-content-left' style={{minHeight: "50vh", minWidth: "100%"}}  >
        <div> 
        <h2  style={{color:'green'}}> Stocks compare (portfolio-chk) </h2> 
        <AuthProvider>

            <div style={{display:'flex'}}>
              {/* <About/>  &nbsp;   &nbsp; 
              <Tutorials/> */}
            </div>
                   {/* <hr/>  */}
            <Router>
              <Routes>
                <Route exact path="/" element={<BasicTable refreshCallBack = {refreshCallBack} logFlags={logFlags} />}/>
                <Route path ="/dashBoard"  element={<Dashboard />}/>
                      {/* <Route path="/" element={<Dashboard/>}   /> */}
                <Route path="/signup" element={<Signup/> } />
                <Route path="/login" element={<Login/> }/>
                <Route path="/forgotPassword" element={<ForgotPassword />}/>
                <Route path="/update-profile" element={<UpdateProfile  />}/>

                <Route path="/tutorials" element={<Tutorials  />}/>
                <Route path="/about" element={<About  />}/>
                <Route path="/logFlags" element={<LogFlags setLogFlags={setLogFlags} checkList={checkList} />}/>
                <Route path="/targetPrice" element={<TargetPrice  />}/>
                <Route path="/manual" element={<Manual  />}/>
                <Route path="/contact" element={<Contact  />}/>
                {/* <Route path="/contact" element={<Contact  />}/> */}

              </Routes>
            </Router>


          </AuthProvider>

          {/* <div>{count}</div> */}
        </div>
      </Container>
      <label count = {count} />
    </div>
  </Suspense>

);
}

export default App;
