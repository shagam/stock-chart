import React, { useState } from 'react'
import { Link, useNavigate, jumpTo } from 'react-router-dom'
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
      console.log ('name: ', result.user.displayName, ' email: ', result.user.email, 'photo: ', result.user.photoURL)
      setError ('');
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
      console.log ('name: ', result.user.displayName, ' email: ', result.user.email, 'photo: ', result.user.photoURL)
      setError ('');
    })
    .catch((error) => {
      if (error) {
        setError (error.message);
          const errorCode = error.code;
          // The email of the user's account used.
          const email = error.email;
          // The AuthCredential type that was used.
          // const credential = provider.credentialFromError(error); 
        }
    })
  }




  async function handleLogout () {
    setError('');
    try {
      await logout();
      navigate('/')
    } catch (e) {setError(e.message) && console.log (e)}
  }

  return (
    <>

  
      <Card>
        <Card.Body>
          <h2 className='text-left mb-4'> Dashboard </h2>
          {error && <Alert variant="danger"> {error} </Alert>}
          
          <div >  <Link to="/" variant="primeray" >   Home </Link></div> 

        <hr/> 
        
        <div style={{display:'flex'}}>
          {currentUser && <div>{currentUser.email}</div> }
          {admin && <div> &nbsp; <strong style={{color: 'red'}}>(admin)</strong> </div>}
        </div>

        <hr/> 


        <button onClick={signInWithGoogle}> Google Sign In</button> 
        {/* <div> &nbsp; &nbsp;  </div>      */}
        <button onClick={signInWithFacebook}>  &nbsp; Facebook Sign In </button> 

        <div className='w-100 text-center mt-2'> Already have an account?  <Link to="/login" > Log In </Link> </div>

        <div className='w-100 text-center mt-2'> Need an account? <Link to="/signup" > Sign Up </Link> </div>

        <div className='btn btn-primery w-100 mt-3'>  <Link to="/update-profile" variant="primeray" >   Update Profile </Link></div>
        
        {currentUser &&<div className='w-100 text-center mt-2'> 
          <Button variant="link" onClick={handleLogout}>Log Out</Button>
        </div>}        
        </Card.Body>

      </Card>

    </>
   )
}
