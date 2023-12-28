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
import {getDateSec} from './table/Date'



function App() {
  const [count, setCount] = useState (0);
  // const { currentUser, logout } = useAuth();
  // const navigate = useNavigate();
  const nowStr = getDateSec()
  console.log(nowStr  + '  %cstock compare start', 'background: #fff; color: #22ef11');
  const [aboutFlag, setAboutFlag] = useState(false);

  const refreshCallBack = (childData) => {
    setCount (count + 1);
  }

  //  Firebase: Error (auth/account-exists-with-different-credential).
  // ngrok http 3000

  return (
    <div className="App-continer">
        {/* <CookieConsent debug={true}> Site uses localStorage, (equivalent to cookies)</CookieConsent> */}
      <Container  className='d-flex align-items-left justify-content-left' style={{minHeight: "50vh", minWidth: "100%"}}  >
        <div> 
        <h2  style={{color:'green'}}> Stocks analyse & compare</h2> 
        <div>
          <input type="checkbox" checked={aboutFlag} onChange={() => {setAboutFlag (! aboutFlag)}} /> About
          {aboutFlag && <div>


            <h5> Analyse and compares stocks / ETF, in the US stock market,</h5> 
            <h5  style={{color:'red'}}> for long term investors.  </h5>
            <h5> Main unique features. to augment the traditional stock market tools. </h5>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}> AlphVatage.co, </h6> <h6> &nbsp; Analysis based on Historical stock prices, recievd from AlphVantage.co</h6>
            </div>

            <hr/> 
            <a href="https://youtu.be/NseqJZNqxaI" >English tutorial</a>  &nbsp; &nbsp; 
            <a href="https://youtu.be/Rv5a0tkMISE" >Hebrew tutorial</a> &nbsp; &nbsp; 
            {/* <a href="https://stocks-compare.netlify.app" >Link to Stocks analyse and compare</a>  */}

            <hr/> 
  
            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}> Long term yearly growth (peak2Peak) </h6> <h6> &nbsp; - from the peak before the 2008 deep, to the peak before 2022 deep  . </h6>
            </div>

            <h6>  &nbsp; &nbsp; Hi-Tech ETF, QQQ NASDAQ has an annual average gain of 15%. </h6>
            <h6>   &nbsp; &nbsp; Behemoth S&P BRK-A, DIA  have an annual average gain of merely 10% </h6>
            
            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}>  Drop recovery analysis </h6> <h6> &nbsp; - calculate the drop and recovery time. </h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}>  </h6> <h6> &nbsp; &nbsp; 2008  QQQ  drops 53%, recovered within 3 years </h6>
              <h6>,   2022  QQQ  Drops 36%,  almost recovered within 2 years   . </h6>
            </div>
    
            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}>volatility </h6> <h6> &nbsp; During deep periods, Hi-Tech drop 50% more than S&P. However Hi-Tech grows more during bear market  </h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}> Logarithmic graph </h6> <h6> &nbsp; - Facilitate comparison of far crashes, like 2022 drop to 2008 drop. </h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}> Target price </h6> <h6> &nbsp; - based an many analysts prediction. Value above 1 means stock price expcted to rise. </h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}> Chart </h6> <h6> &nbsp; Compares a few stocks, yearly_gain, zoom, date range, logarithmic. </h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}> Table </h6> <h6> &nbsp; Compare many stocks, yearly_gain, column sort, column-hide, filter, basic stock info . </h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}>Get stocks preformed better than QQQ </h6> <h6> &nbsp; Year, 2Year, 5Year, 10Year (from select list)</h6>
            </div>

            <div style={{display:'flex'}} >
              <h6 style={{color:'red'}}>Price / high </h6> <h6> &nbsp; Compare today price with high bifore deep. (How far from recovery) </h6>
            </div>
            <div style={{display:'flex'}} >
              <h6> I base my selection on 2 factors: &nbsp; </h6><h6 style={{color:'red'}}>Long Term gain (The past),
              </h6><h6> &nbsp; and on  &nbsp;</h6><h6 style={{color:'red'}}> analist target, prediction. (Near future) </h6>
            </div>
            <h6> Wisdom of the crowd </h6>
            <hr/> 
            <h6>       Open source -  github.com/shagam/stock-chart </h6>

            <h6>      Written in ReactJS, on top of JavaScript.</h6> 
            <h6>      The tool is free. Pease share it with anyone </h6>
            <hr/> 
         </div>
          }
        </div>   
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
