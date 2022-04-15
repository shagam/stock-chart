import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Alert } from 'react-bootstrap'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'

import { updateCurrentUser } from 'firebase/auth';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { auth } from '../table/firebase-config'

// import {  useAuth, logout } from '../contexts/AuthContext';

export default function Dashboard (props) {
  const [error, setError] = useState ('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();


  async function handleLogout () {
    setError('');
    try {
      await logout();
      navigate('/login')
    } catch (e) {setError(e.message) && console.log (e)}
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


  return (
    <>

      <Card>
        <Card.Body>
          <h2 className='text-left mb-4'> Sign In Dashboard </h2>
          {error && <Alert variant="danger"> {error} </Alert>}
          {currentUser && <div><strong>Email:        </strong> {currentUser.email}</div> }

          <hr/>
        <div> 
          <button onClick={signInWithGoogle}> Google Sign In</button>      
          <button onClick={signInWithFacebook}> Facebook Sign In </button>  
          {/* <button onClick={handleLogout}> logout</button>     */}
        </div>

        {/* {props.admins[0].name}  */}
        {/* <div className='w-100 text-center mt-2'>  <Link to="/dina" > {props.admins[0].name} Gallery </Link> </div>

        <div className='w-100 text-center mt-2'>  <Link to="/test" > {props.admins[1].name} Gallery  </Link> </div> */}

        <hr/>     <hr/>
        
        {/* {currentUser && <div><strong>Email:  </strong> {currentUser.email}</div> } */}

        <div className='w-100 text-center mt-2'> Already have an account?  <Link to="/login" > Log In </Link> </div>

        <div className='w-100 text-center mt-2'> Need an account? <Link to="/signup" > Sign Up </Link> </div>

        <div className='btn btn-primery w-100 mt-3'>  <Link to="/update-profile" variant="primeray" >   Update Profile </Link></div>
        
        <div className='w-100 text-center mt-2'> <Button variant="link" onClick={handleLogout}>Log Out</Button> </div>

        <div className='btn btn-primery w-100 mt-3'>  <Link to="/" variant="primeray" >   Stock-Table </Link></div>
        
        </Card.Body>

      </Card>

    </>
   )
}
