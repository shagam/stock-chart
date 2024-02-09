import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';

import emailjs from '@emailjs/browser';

export default function ContactUs (props)  {

  const nameRef = useRef()
  const emailRef = useRef();
  // const emailConfirmRef = useRef();
  const pictureRef = useRef();
  const commentRef = useState();

  const form = useRef();

  const [error, setError] = useState ('');
  const [loading, setLoading] = useState(false);


  const navigate = useNavigate();
  

   function sendEmail (e) {
    e.preventDefault();
    // if (emailRef.current.value !== emailConfirmRef.current.value) {
    //   return setError ('Passwords do not match')
    // } 

      console.log (form.current)
      emailjs.sendForm('service_hckn29m', 'template_g6rsdnw', form.current, 'HNB274P5Zug2myTir')
        .then((result) => {
            console.log(result.text);
        }, (error) => {
            console.log(error.text);
        });
        e.target.reset()
    };

  //   try {
  //     setError('');
  //     setLoading(true);
  //     // await login (emailRef.current.value, passwordRef.current.value)
  //     navigate ('/')

  //   } catch (e) {setError (e.message)}
  //   setLoading (false);
  // }

  return (
    <section>
      <div className='container'>
        <h2 className="--text-center"> Contact Us </h2>
        <form ref={form} onSubmit={sendEmail}
          className="--form-control --card --flex-center --dir-column">
          <label>Name</label>
          <input type="text" name="user_name" placeholder="Full Name" />
          <label>Email</label>
          <input type="email" name="user_email" placeholder="Email" />
          <label>Message</label>
          <textarea name="message" />
          <input type="submit" value="Send" />
          &nbsp; <Link to="/" >Home</Link>
        </form>

      </div>
    </section>
  );


 
}
