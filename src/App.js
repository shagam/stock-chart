import React, {useState, useMemo, Suspense, lazy} from 'react';
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
import {getDateSec} from './utils/Date'
// import CookieConsent from "react-cookie-consent"


import AuxilaryLinks from './table/AuxilaryLinks'
// import {BasicTable} from './table/BasicTable' 
const BasicTable  = lazy(() => import ( './table/BasicTable'));


const Manual = lazy(() => import ('./manual/Manual'))


 const navigation = performance.getEntriesByType("navigation")[0];

if (navigation?.type === "reload") {
  window.history.replaceState(null, "", "/");
}

function App() {
  const [count, setCount] = useState (0);

  // var logFlags_  = useMemo(() => localStorage.getItem('logFlags'), []);
  // if (logFlags_ === null)
  //   logFlags_ = JSON.parse(logFlags_)
  // if (logFlags_ !== logFlags) 
  //   setLogFlags(logFlags_)

  
  // const { currentUser, logout } = useAuth();
  // const navigate = useNavigate();
  const nowStr = getDateSec()
  console.log(nowStr  + '  %cstock compare start', 'background: #fff; color: #22ef11');


  //  Firebase: Error (auth/account-exists-with-different-credential).
  // ngrok http 3000
  // <Route path="/contact" element={<Contact  />}/>

  return (
    <Suspense fallback={<div>Loading ... (from App) </div>}>
    <div className="App-continer">
        {/* <CookieConsent debug={true}> Site uses localStorage, (equivalent to cookies)</CookieConsent> */}
      <Container  className='d-flex align-items-left justify-content-left' style={{minHeight: "50vh", minWidth: "100%"}}  >
        <div> 
     
          <AuthProvider>

            <div style={{display:'flex'}}>
              {/* <About/>  &nbsp;   &nbsp; 
              <Tutorials/> */}
            </div>
                   {/* <hr/>  */}
            <Router>
              <Routes>
                <Route exact path="/*" element={<BasicTable />}/>
             
                {/* <Route path="/tutorials" element={<Tutorials  />}/> */}
               

                <Route path="/manual" element={<Manual  />}/>



              </Routes>
            </Router>


          </AuthProvider>


        </div>
      </Container>

    </div>
  </Suspense>

);
}

export default App;
