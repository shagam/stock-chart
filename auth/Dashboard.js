import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Button, Alert } from 'react-bootstrap'
import { updateCurrentUser } from 'firebase/auth';

import {  useAuth, logout } from './contexts/AuthContext';

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

  return (
    <>

      <Card>
        <Card.Body>
          <h2 className='text-center mb-4'> Dashboard </h2>
          {error && <Alert variant="danger"> {error} </Alert>}

        {/* {props.admins[0].name}  */}
        <div className='w-100 text-center mt-2'>  <Link to="/dina" > {props.admins[0].name} Gallery </Link> </div>

        <div className='w-100 text-center mt-2'>  <Link to="/test" > {props.admins[1].name} Gallery  </Link> </div>

        <hr/>     <hr/>
        
        {currentUser && <div><strong>Email:  </strong> {currentUser.email}</div> }

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
