import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import IpContext from '../contexts/IpContext';
import {beep2} from '../table/ErrorList'
import DatePicker, {moment} from 'react-datepicker';
  
export default function ContactGet (props)  {

    const nameRef = useRef()

  
    // const emailConfirmRef = useRef();
    const pictureRef = useRef();
    const commentRef = useState();
  
    const form = useRef();
  
    const [error, setError] = useState ('');
    const [loading, setLoading] = useState(false);
    const [stat, setStat] = useState()
  
    const navigate = useNavigate();
    const [chartDate, setChartDate] = useState (new Date(2002, 9, 15));

    // const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();
  

    function contactGet (e) {

        e.preventDefault();
        // if (emailRef.current.value !== emailConfirmRef.current.value) {
        //   return setError ('Passwords do not match')
        // } 
        console.log (getDate(), 'contactGet params', 'name=', nameRef.current.value, )
        // console.log (form.current)
        // console.log (localIpv4, city, countryName, countryCode)
    
        const ssl = true
        const PORT = 5000
        const corsServer = 'dinagold.org'
        var corsUrl;
        if (ssl)
          corsUrl = "https://";
        else 
          corsUrl = "http://"
    
          corsUrl += corsServer+ ":" + PORT + "/contactGet";
          corsUrl += '?after=' + 'true' + '&year=' + 2024 + '&mon=' + 5 + '&day=' + 21; 
          // corsUrl += '?on=' + 'true' + '&year=' + 2024 + '&mon=' + 5 + '&day=' + 21;
          // corsUrl += '?name=' + 'eli'
          // corsUrl += '?last=' + 3
    
          const miliStart =  Date.now();
          setStat(getDate() + ' msg sent to server', corsUrl)
          axios.get (corsUrl)
          // getDate()
          .then ((result) => {
            if (result.status !== 200)
              return;
            const miliEnd =  Date.now()
            console.log (getDate() +  ' msg sent')
            const latency = miliEnd - miliStart

            console.log (result.data)
            setStat(getDate() + ' msg sent (' + latency + ' mili)')
          })
          .catch ((err) => {
          // setError([sym, 'email', err.message, corsUrl])
            console.log(getDate(), 'email', err, corsUrl)
          })     
    
    
        };


        const [analyzeTool, setAnalyzeTool] = useState()
        const onOptionChange = e => {
          const tool = e.target.value;
          setAnalyzeTool(tool)
          // console.log(tool)
        }
      
  
      return (
        <div style={{width:'100%', fontSize: '20px'}}>

        <Card>
        <Card.Body>
          <h2 className='text-center mb-4'>Contact get</h2>
          &nbsp; <Link to="/" >Home</Link>
          {error && <Alert variant="danger"> {error} </Alert>}
          <hr/> 
          {/* <br/> */}
          <div style={{display:'flex'}}>
              <input style={{marginLeft: '0px'}}  type="radio" name="mon" value='dropRecovery' id='0' checked={analyzeTool==='dropRecovery'} onChange={onOptionChange}/> all &nbsp;         
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='peak2peak' id='1' checked={analyzeTool==='peak2peak'} onChange={onOptionChange}/> week &nbsp;    
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='peak2peak' id='1' checked={analyzeTool==='peak2peak'} onChange={onOptionChange}/> day &nbsp;    

            </div>
            <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
                dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate(date)} /> &nbsp; &nbsp; </div>
                
            <button onClick={() =>{contactGet('all')} }> getAll</button>&nbsp;  
            
            <hr/> 

          <Form onSubmit={contactGet}>
          {/* <div>&nbsp;</div> */}
            <Form.Group id="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control style={{fontSize: '30px'}} type="text" ref= {nameRef} required />
            </Form.Group>
            <hr/> 
    
            <Button  style={{fontSize: '23px'}} disabled={loading} className="w-40" type="submit"> get </Button>
          </Form>
        </Card.Body>
        </Card>
            <div>{stat}</div>
        </div>
      );
    
    

}