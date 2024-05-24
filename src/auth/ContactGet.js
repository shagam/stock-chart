import React, { useState, useRef } from 'react'
import { Form, Button, Card, Alert, Container } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import IpContext from '../contexts/IpContext';
import {beep2} from '../table/ErrorList'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import GetInt from '../utils/GetInt'
import GlobalFilter from '../table/GlobalFilter'
import MobileContext from '../contexts/MobileContext'



export default function ContactGet (props)  {

    const nameRef = useRef()

    const form = useRef();
  
    const [error, setError] = useState ('');
    const [loading, setLoading] = useState(false);
    const [stat, setStat] = useState()
    const [textArray, setTextArray] = useState();
    const navigate = useNavigate();
    const [searchDate, setSearchDate] = useState (new Date(2024, 4, 20));
    const [count, setCount] = useState(5);

    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

    const [searchType, setSearchType] = useState()
    const [searchText,setSearchText] = useState()

    const searchYear = searchDate.getFullYear();
    const searchMon = searchDate.getMonth() + 1; // [1..12]
    const searchDay = searchDate.getDate(); // [1..31]
    const chartDateArr = [searchYear, searchMon, searchDay]
 
    
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
    
          corsUrl += corsServer+ ":" + PORT + "/contactGet?search";
    
          // if (searchType === 'date')
            corsUrl += '&year=' + searchYear + '&mon=' + searchMon + '&day=' + searchDay; 
          if (searchText)
            corsUrl += '&name=' + searchText
          if (count)
            corsUrl += '&count=' + count

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
            // console.log (getDate() +  ' msg sent')
            const latency = miliEnd - miliStart

            console.log (result.data)
            setStat(getDate() + ' response (' + latency + ' mili)' + ' count=' + result.data.length )

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
          <div>
    
            <GetInt init={count} callBack={setCount} title='getCount' type='Number' pattern="[0-9]+"/>    


            <GlobalFilter className="stock_button_class" filter={searchText} setFilter={setSearchText} name='Search_name' isMobile={isMobile}/> 


            <div>&nbsp;</div>
    
            <div  > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
                dateFormat="yyyy-LLL-dd" selected={searchDate} onChange={(date) => setSearchDate(date)} /> &nbsp; &nbsp; </div>
            </div>

           
            <div>&nbsp;</div>
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

            {textArray && textArray.map((item,k) =>
               <li key={k}>date: {item.date} name: {item.name},  email: {item.email},
                <div> txt: {item.text}</div></li>)} 
            
        </div>
      );
    
    

}