import React, { useState, useRef, useEffect } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../contexts/AuthContext';



export default function Login (props)  {
  const emailRef = useRef();
  const passwordRef = useRef();

  const { login, currentUser } = useAuth(); //, currentUser
  const [error, setError] = useState ('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword]= useState(false);

  const toggleShowPassword = () => {setShowPassword (! showPassword)}

  const navigate = useNavigate();
  

  async function handleSubmit (e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login (emailRef.current.value, passwordRef.current.value)
      navigate ('/')

      if (currentUser && currentUser.emai === 'eli.shagam.gmail.com') {
        props.setAdmin (true)
      }

    } catch (e) {setError (e.message)}
    setLoading (false);
  }


  return (

    <>
      <Card>
        <Card.Body>
          <h2 className='text-center mb-4'> Log In</h2>
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

            <div>
            <input
            type="checkbox" checked={showPassword}  
            onChange={toggleShowPassword}
            /> Show password  
           </div>
           <hr/>
            <Button disabled={loading} className="w-100" type="submit"> Log in </Button>
          </Form>
        </Card.Body>
      </Card>

      <div className='w-100 text-center mt-2'>
        Need an account? <Link to="/signup" > Sign Up </Link>
      </div>

      <div className='w-100 text-center mt-2'>
        Forgot Password? <Link to="/ForgotPassword" > Reset Password </Link>
      </div>
      
      <div className='w-100 text-center mt-2'>  <Link to="/dashboard" > Dashboard </Link> </div>

    </>
  )
}
