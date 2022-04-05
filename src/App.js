import React, {useState} from 'react';
import './App.css';
// import StockTable from './Stock-table';
import {BasicTable} from './table/BasicTable' 
import { auth } from './table/firebase-config'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

function App() {
  const [count, setCount] = useState (0);
  
  const refreshCallBack = (childData) => {
    setCount (count + childData);
  }

  const provider = new GoogleAuthProvider()
  const signInWithGoogle = () => {
     signInWithPopup(auth, provider)
     .then ((result) => {
  
       const profilePic = result.user.photoURL;
       const phone = result.user.phoneNumber;
       console.log(result, result.user.email, result.user.name, profilePic, phone)
  
     }).catch((error) => {
       alert (error.message)
     })
  };


  return (
    <div className="App-continer">
      <div> 
        <button onClick={signInWithGoogle}> Sign In With Google</button>      
      </div>
      <div>
        <BasicTable refreshCallBack = {refreshCallBack} />
        <label count = {count} />
      </div>
    </div>

);
}

export default App;
