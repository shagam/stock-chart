import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../table/Date'
import IpContext from '../table/IpContext';


export default function ContactUs (props)  {

  const nameRef = useRef()
  const emailRef = useRef();
  const messageRef = useRef();

  // const emailConfirmRef = useRef();
  const pictureRef = useRef();
  const commentRef = useState();

  const form = useRef();

  const [error, setError] = useState ('');
  const [loading, setLoading] = useState(false);
  const [stat, setStat] = useState()

  const navigate = useNavigate();
  const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
  

   function sendEmail (e) {

    e.preventDefault();
    // if (emailRef.current.value !== emailConfirmRef.current.value) {
    //   return setError ('Passwords do not match')
    // } 
    console.log (getDate(), 'email params', 'name=', nameRef.current.value, 'email=', emailRef.current.value, 'message='+ messageRef.current.value)
    // console.log (form.current)
    console.log (localIp, localIpv4, city, countryName, countryCode)

    const ssl = true
    const PORT = 5000
    const corsServer = 'dinagold.net'
    var corsUrl;
    if (ssl)
      corsUrl = "https://";
    else 
      corsUrl = "http://"

    corsUrl += corsServer+ ":" + PORT + "/email" +  '?name=' +  nameRef.current.value +
      "&email="+ emailRef.current.value + '&ip=' + localIpv4 +
      '&city=' + city + '&countryName=' + countryName + '&countryCode=' + countryCode +
      '&message='+messageRef.current.value;

      const miliStart =  Date.now();
      setStat(getDate() + ' msg sent to server')
      axios.get (corsUrl)
      // getDate()
      .then ((result) => {
        if (result.status !== 200)
          return;
        const miliEnd =  Date.now()
        console.log (getDate() + ' ' + emailRef.current.value + ' msg sent')
        const latency = miliEnd - miliStart
        setStat(getDate() + ' ' + emailRef.current.value + ' msg sent (' + latency + ' mili)')
      })
      .catch ((err) => {
      // setError([sym, 'email', err.message, corsUrl])
        console.log(getDate(), 'email', err, corsUrl)
      })     


      // emailjs.sendForm('service_hckn29m', 'template_g6rsdnw', form.current, 'cWaOkZhGCDz_uQceT')
      //   .then((result) => {
      //       console.log(result.text);
      //   }, (error) => {
      //       console.log(error.text);
      //   });
      //   e.target.reset()
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
    <div style={{width:'100%', fontSize: '20px'}}>

    <Card>
    <Card.Body>
      <h2 className='text-center mb-4'>Contact Us</h2>
      &nbsp; <Link to="/" >Home</Link>
      {error && <Alert variant="danger"> {error} </Alert>}
      <Form onSubmit={sendEmail}>
      {/* <div>&nbsp;</div> */}
        <Form.Group id="name">
          <Form.Label>Full Name</Form.Label>
          <Form.Control style={{fontSize: '30px'}} type="text" ref= {nameRef} required />
        </Form.Group>
        <hr/> 

        <Form.Group id="email">
          <Form.Label>Email</Form.Label>
          <Form.Control style={{fontSize: '30px'}} type="email" ref= {emailRef} required />
        </Form.Group>
        <hr/>

        <div>Message</div>
        <Form.Group id="message" className="mb-3" controlId="text">
          <Form.Control style={{fontSize: '25px', height: '20vh'}} as="textarea" ref= {messageRef} required  type="text"
           placeholder=""  defaultValue={''}/>
        </Form.Group>

        {/* <Form.Group id="text">
          <Form.Label>Message</Form.Label>
          <Form.Control type="email" ref= {messageRef} required />
        </Form.Group> */}
        <hr/>

        <Button  style={{fontSize: '23px'}} disabled={loading} className="w-40" type="submit"> Send </Button>
      </Form>
    </Card.Body>
    </Card>
        <dev>{stat}</dev>

    </div>
  );


 
}
