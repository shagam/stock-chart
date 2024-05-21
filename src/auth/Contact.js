import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../table/Date'
import IpContext from '../contexts/IpContext';
import {beep2} from '../table/ErrorList'

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
  const [info, setInfo] = useState()

  const navigate = useNavigate();
  const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
  

   function sendEmail (e) {

    e.preventDefault();
    // if (emailRef.current.value !== emailConfirmRef.current.value) {
    //   return setError ('Passwords do not match')
    // } 
    console.log (getDate(), 'email params', 'name=', nameRef.current.value, 'email=', emailRef.current.value, 'message='+ messageRef.current.value)
    // console.log (form.current)
    // console.log (localIpv4, city, countryName, countryCode)

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
      setInfo(getDate() + ' msg sent to server')
      setStat()
      axios.get (corsUrl)
      // getDate()
      .then ((result) => {
        if (result.status !== 200)
          return;
        const miliEnd =  Date.now()
        console.log (getDate() +  ' msg arrived, from=' + emailRef.current.value )
        const latency = miliEnd - miliStart
        setInfo()
        setStat(getDate() + ' msg arrived') // + '  (' + latency + ' mili)
        nameRef.current.value= null
        // emailRef.current.value= null
        // messageRef.current.value = null;
        beep2()
      })
      .catch ((err) => {
      // setError([sym, 'email', err.message, corsUrl])
        console.log(getDate(), 'msg', err, corsUrl)
      })     
    };


  return (
    <div style={{width:'120%', fontSize: '18px'}}>

    <Card>
    <Card.Body>
      <h2 className='text-center mb-4'>Contact Us</h2>
      &nbsp; <Link to="/" >Home</Link>
      {error && <Alert variant="danger"> {error} </Alert>}
      <Form onSubmit={sendEmail}>
      {/* <div>&nbsp;</div> */}
        <Form.Group id="name">
          <Form.Label>Full Name</Form.Label>
          <Form.Control style={{fontSize: '22px'}} type="text" ref= {nameRef} required />
        </Form.Group>
        {/* <hr/>  */}

        <Form.Group id="email">
          <Form.Label>Email</Form.Label>
          <Form.Control style={{fontSize: '22px'}} type="email" ref= {emailRef} required />
        </Form.Group>
        {/* <hr/> */}

        <div>Message</div>
        <Form.Group id="message" className="mb-3" controlId="text">
          <Form.Control style={{fontSize: '20px', height: '20vh'}} as="textarea" ref= {messageRef} required  type="text"
           placeholder=""  defaultValue={''}/>
        </Form.Group>

        {/* <Form.Group id="text">
          <Form.Label>Message</Form.Label>
          <Form.Control type="email" ref= {messageRef} required />
        </Form.Group> */}
        <hr/>
        <Button  style={{fontSize: '23px'}} disabled={loading} className="w-40" type="submit"> Send </Button>
      </Form>
      <dev>{info}</dev>
      <dev style={{color:'red'}}>{stat}</dev>
    </Card.Body>
    </Card>

    </div>
  );


 
}
