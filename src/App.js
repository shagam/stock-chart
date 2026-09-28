import React, {useState, useMemo, Suspense, lazy} from 'react';
// import './App.css';
// import StockTable from './Stock-table';

// import { auth } from './firebaseConfig'
// import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'

import { useAuth, AuthProvider } from './contexts/AuthContext';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { Link, useNavigate } from 'react-router-dom'
// import { Card, Button, Alert } from 'react-bootstrap'
// import { Form } from 'react-bootstrap'
import {getDateSec} from './utils/Date'



// import {BasicTable} from './table/BasicTable' 
const BasicTable  = lazy(() => import ( './table/BasicTable'));


// const Manual = lazy(() => import ('./manual/Manual'))


//  const navigation = performance.getEntriesByType("navigation")[0];

// if (navigation?.type === "reload") {
//   window.history.replaceState(null, "", "/");
// }

function App() {




  // const nowStr = getDateSec()
  // console.log(nowStr  + '  %cstock compare start', 'background: #fff; color: #22ef11');




  return (
    <Suspense>
     
          <AuthProvider>

                   {/* <hr/>  */}
            <Router>
              <Routes>
                <Route exact path="/*" element={<BasicTable />}/>
             
              



              </Routes>
            </Router>


          </AuthProvider>




  </Suspense>

);
}

export default App;
