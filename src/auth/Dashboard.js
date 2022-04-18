import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Alert } from 'react-bootstrap'

import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, updateCurrentUser } from 'firebase/auth'
import { auth } from '../firebaseConfig'
import {  useAuth, logout } from '../contexts/AuthContext';

export default function Dashboard (props) {
  const [error, setError] = useState ('');
  const { currentUser, admin, logout } = useAuth();
  const navigate = useNavigate();


  const signInWithFacebook = async  () => {
    const provider = new FacebookAuthProvider();
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
    .then((result => {
      console.log(result)
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = provider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;

    }))
    .catch((error) => {
      console.log(error.message)
      setError (error.message);
       // Handle Errors here.
       const errorCode = error.code;
       const errorMessage = error.message;
       // The email of the user's account used.
       const email = error.email;
       // The AuthCredential type that was used.
      //  const credential = provider.credentialFromError(error);
    })
  }

  const signInWithGoogle = async  () => {
    const provider = new GoogleAuthProvider();
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    signInWithPopup(auth, provider)
    .then((result) => {
      console.log(result)
         // This gives you a Google Access Token. You can use it to access the Google API.
         const credential = provider.credentialFromResult(result);
         const token = credential.accessToken;
         // The signed-in user info.
         const user = result.user;
         console.log(result)
    })
    .catch((error) => { 
      console.log(error.message)
      setError (error.message);
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.email;
          // The AuthCredential type that was used.
          // const credential = provider.credentialFromError(error); 
    })
  }




  async function handleLogout () {
    setError('');
    try {
      await logout();
      navigate('/dashBoard')
    } catch (e) {setError(e.message) && console.log (e)}
  }

  return (
    <>

  
      <Card>
        <Card.Body>
          <h2 className='text-left mb-4'> Dashboard </h2>
          {error && <Alert variant="danger"> {error} </Alert>}
          
          <div className='btn btn-primery w-100 mt-3'>  <Link to="/" variant="primeray" >   Stock-Table </Link></div> 

        <hr/>  <hr/>
        
        <div style={{display:'flex'}}>
          {currentUser && <div><strong>Email:  </strong> {currentUser.email}</div> }
          {admin && <div> &nbsp; <strong>(admin)</strong> </div>}
        </div>




        <button onClick={signInWithGoogle}> Google Sign In</button> 
        {/* <div> &nbsp; &nbsp;  </div>      */}
        <button onClick={signInWithFacebook}>  &nbsp; Facebook Sign In </button> 

        <div className='w-100 text-center mt-2'> Already have an account?  <Link to="/login" > Log In </Link> </div>

        <div className='w-100 text-center mt-2'> Need an account? <Link to="/signup" > Sign Up </Link> </div>

        <div className='btn btn-primery w-100 mt-3'>  <Link to="/update-profile" variant="primeray" >   Update Profile </Link></div>
        
        <div className='w-100 text-center mt-2'> 
          <Button variant="link" onClick={handleLogout}>Log Out</Button>
        </div>        
        </Card.Body>

      </Card>

    </>
   )
}
