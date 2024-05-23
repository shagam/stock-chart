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
import GetInt from '../utils/GetInt'


export default function ContactGet (props)  {

    const nameRef = useRef()

    const form = useRef();
  
    const [error, setError] = useState ('');
    const [loading, setLoading] = useState(false);
    const [stat, setStat] = useState()
    const [textArray, setTextArray] = useState();
    const navigate = useNavigate();
    const [chartDate, setChartDate] = useState (new Date(2002, 9, 15));
    const [count,setCount] = useState(8);

    const [searchType, setSearchType] = useState()

    const onOptionChange = e => {
      const tool = e.target.value;
      setSearchType(tool)
      console.log(tool)
    }

    function contactGet (e) {

        e.preventDefault();

        console.log (getDate(), 'contactGet params', 'name=', nameRef.current.value, )
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
    
          corsUrl += corsServer+ ":" + PORT + "/contactGet";

          if (searchType == 'date')
            corsUrl +==' + 'true' + '&year=' + 2024 + '&mon=' + 5 + '&day=' + 21; 
          // corsUrl += '?on=' + 'true' + '&year=' + 2024 + '&mon=' + 5 + '&day=' + 21;
          if (searchType == 'name')
            corsUrl += '?name=' + 'eli'
          if (searchType == 'count')
            corsUrl += '?last=' + count
    
          const miliStart =  Date.now();
          setStat(getDate() + ' msg sent to server', corsUrl)
          setTextArray()
          setError()
          console.log ('url', corsUrl)
          axios.get (corsUrl)
          // getDate()
          .then ((result) => {
            if (result.status !== 200)
              return;
            const miliEnd =  Date.now()
            // const parsedList = JSON.parse(result.data)
            console.log (getDate() +  ' msg sent')
            const latency = miliEnd - miliStart

            console.log (result.data)
            setStat(getDate() + ' msg sent (' + latency + ' mili)')

            const withNL = [];
            // for (let i = 0; i < result.data.length; i++)
            //   withNL.push(result.data[i].replaceAll('_NL_','\n'))
            setTextArray(result.data) // display list of contact requests
          })
          .catch ((err) => {
          // setError([sym, 'email', err.message, corsUrl])
            console.log(getDate(), 'contact', err, corsUrl)
          })     
    
    
        };
      
  
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
        
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='count' id='0' checked={searchType==='count'} onChange={onOptionChange}/> count &nbsp;    
              <input style={{marginLeft: '5px'}}  type="radio" name="mon" value='date' id='1' checked={searchType==='date'} onChange={onOptionChange}/> date &nbsp;    
              <input style={{marginLeft: '0px'}}  type="radio" name="mon" value='name' id='2' checked={searchType==='name'} onChange={onOptionChange}/> name &nbsp; 
            </div>
            <div style={{display:'flex'}} > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
                dateFormat="yyyy-LLL-dd" selected={chartDate} onChange={(date) => setChartDate(date)} /> &nbsp; &nbsp; </div>


            <GetInt init={count} callBack={setCount} title='getCount' type='Number' pattern="[0-9]+"/>    
            
            <button onClick={() =>{contactGet('all')} }> get</button>&nbsp;  
            
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
            {textArray && textArray.map((item,k) => <li key={k}> name: {item.name},  email: {item.email},  txt: {item.text}</li>)} 
            
        </div>
      );
    
    

}