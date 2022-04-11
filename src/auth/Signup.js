import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

import { AuthProvider, useAuth } from '../contexts/AuthContext';


export default function Signup ()  {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();

  const { signup, currentUser } = useAuth(); //, currentUser
  const [error, setError] = useState ('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword]= useState(false);
  
  const toggleShowPassword = () => {setShowPassword (! showPassword)}

  const navigate = useNavigate();

  async function handleSubmit (e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError ('Passwords do not match')
    } 

    // if (passwordRef.current.value.length < 6) {
    //   return setError ('Passwords length need at least 6 ')
    // }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value)
      navigate ('/')
      const a = 1;
    } catch (e) {setError (e.message)}
    setLoading (false);
  }


  return (

    <>
      <Card>
        <Card.Body>
          <h2 className='text-center mb-4'> Sign up</h2>
          {currentUser && <div><strong>Email:  </strong> {currentUser.email}</div> }

          {error && <Alert variant="danger"> {error} </Alert>}
          <hr/>   
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref= {emailRef} required />
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type={showPassword?"text":"Password"} ref = {passwordRef} required />
            </Form.Group>

            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control type={showPassword?"text":"Password"} ref = {passwordConfirmRef} required />
            </Form.Group>
            
            <div>
            <input
            type="checkbox" checked={showPassword}  
            onChange={toggleShowPassword}
            /> Show password  
           </div>
           <hr/>   
            <Button disabled={loading} className="w-100" type="submit"> Sign Up </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className='w-100 text-center mt-2'>
        Already have an account?  <Link to="/login" > Log In </Link>

      </div>
      <div className='w-100 text-center mt-2'>  <Link to="/dashboard" > Dashboard </Link> </div>
    </>
  )
}
