import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import {IpContext, getIpInfo} from '../contexts/IpContext';
import {beep2} from '../utils/ErrorList'

export default function ContactUs (props)  {

  const nameRef = useRef()
  const emailRef = useRef();
  const messageRef = useRef();

  const emailConfirmRef = useRef();
  const pictureRef = useRef();
  const commentRef = useState();

  const form = useRef();

  const [error, setError] = useState ('');
  const [loading, setLoading] = useState(false);
  const [stat, setStat] = useState()
  const [info, setInfo] = useState()

  const navigate = useNavigate();
  const {localIp, localIpv4, eliHome, city, countryName, countryCode, regionName} = IpContext();
  

   function sendContact (e) {
  
    // const ipInfo =getIpInfo()
    // console.log (ipInfo)

    e.preventDefault();
    if (emailRef.current.value !== emailConfirmRef.current.value) {
      return setError ('Email_confirm do not match')
    } 
    console.log (getDate(), 'email params', 'name=', nameRef.current.value, 'email=', emailRef.current.value, 'text='+ messageRef.current.value)
    // console.log (form.current)
    // console.log (localIpv4, city, countryName, countryCode)

    const ssl = true
    const PORT = 5000
    const corsServer = props.server //'dinagold.net'
    var corsUrl;
    if (ssl)
      corsUrl = "https://";
    else 
      corsUrl = "http://"

    const txt = messageRef.current.value;
    const txtSplit = txt.replaceAll("\n",'_NL_');
    console.log ('txtSplit:', txtSplit)
    corsUrl += corsServer+ ":" + PORT + "/contactUs" +  '?name=' +  nameRef.current.value +
      "&email="+ emailRef.current.value + 
      // '&ip=' + localIpv4 +
      '&city=' + city + '&region=' + regionName+ '&country=' + countryName 
      // '&message='+txtArray;
      + '&text='+txtSplit;
      console.log (corsUrl)
      const miliStart =  Date.now();
      setInfo(getDate() + ' msg sent to server')
      const mili = Date.now();

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
        setStat(getDate() + ' msg reeived (latency=' + latency + ')')

        const response = Date.now() - mili
        setError()// 'delay(msec)=' + response)
        nameRef.current.value= null
        // emailRef.current.value= null
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
      <Form onSubmit={sendContact}>

      <div>&nbsp;</div>
        <Form.Group id="name"  style={{display:'flex'}}>
          <Form.Label style={{color: 'magenta', marginTop: '3px', width: '150px'}}>Name&nbsp;</Form.Label>
          <Form.Control style={{fontSize: '22px', backgroundColor: '	#7FFF00', height: '35px'}} type="text" ref= {nameRef} required />&nbsp;
          <Form.Label style={{color: 'blue', marginTop: '3px', width: '120px'}}> (required)&nbsp;</Form.Label>
        </Form.Group>

        <Form.Group id="email"  style={{display:'flex'}}>
          <Form.Label style={{color: 'magenta', marginTop: '3px', width: '150px'}}>Email </Form.Label>&nbsp;
          <Form.Control style={{fontSize: '22px', backgroundColor: '	#7FFF00', height: '35px'}} type="email" ref= {emailRef} required/> &nbsp;
          <Form.Label style={{color: 'blue', marginTop: '3px', width: '120px'}}> (required)&nbsp;</Form.Label>
        </Form.Group>

        {/* <hr/>  */}

        <Form.Group id="email1" style={{display:'flex'}}>
          <Form.Label style={{color: 'magenta', marginTop: '3px', width: '150px'}}>EmailConfirm </Form.Label>
          <Form.Control style={{fontSize: '22px', backgroundColor: '	#7FFF00', height: '35px'}} type="email" ref= {emailConfirmRef} required />&nbsp;
          <Form.Label style={{color: 'blue', marginTop: '3px', width: '120px'}}> (required)</Form.Label>
        </Form.Group>

        {/* <hr/> */}

        <div style={{color: 'magenta'}}>Text</div>
        <Form.Group id="message" className="mb-3" controlId="text">
          <Form.Control style={{fontSize: '20px', height: '20vh', backgroundColor: '	#c0e0c0'}} as="textarea" ref= {messageRef} required  type="text"
           placeholder=""  defaultValue={''}/>
        </Form.Group>

          <hr/>
        <Button  style={{fontSize: '23px'}} disabled={loading} className="w-40" type="submit"> Send </Button>
      </Form>
      <div>{info}</div>
      <div style={{color:'red'}}>{stat}</div>
    </Card.Body>
    </Card>

    </div>
  );


 
}
