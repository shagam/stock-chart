import React, {useState} from 'react';
import './App.css';
// import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 
import { auth } from './table/firebase-config'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'

function App() {
  const [count, setCount] = useState (0);
  
  const refreshCallBack = (childData) => {
    setCount (count + childData);
  }


  const signInWithGoogle = () => {
    const googleProvider = new GoogleAuthProvider()
    signInWithPopup(auth, googleProvider)
     .then ((result) => {
       const profilePic = result.user.photoURL;
       const phone = result.user.phoneNumber;
       console.log(result, result.user.email, result.user.name, profilePic, phone)
     }).catch((error) => {
       alert (error.message)
     })
  };


  const signInWithFacebook = () => {
    const facebookProvider = new FacebookAuthProvider()
    signInWithPopup(auth, facebookProvider)
     .then ((result) => {
       const profilePic = result.user.photoURL;
       const phone = result.user.phoneNumber;
      //  console.log(result, result.user.email, result.user.name, profilePic, phone)
       console.log(result)
     }).catch((error) => {
       alert (error.message)
     })
  };
//  Firebase: Error (auth/account-exists-with-different-credential).
// ngrok http 3000


  return (
    <div className="App-continer">
      <div> 
        <button onClick={signInWithGoogle}> Sign In With Google</button>      
        <button onClick={signInWithFacebook}> Sign In With Facebook</button>    
      </div>
      <div>
        <BasicTable refreshCallBack = {refreshCallBack} />
        <label count = {count} />
      </div>
    </div>

);
}

export default App;
