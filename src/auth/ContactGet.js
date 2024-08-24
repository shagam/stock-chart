import React, { useState, useEffect} from 'react'
import { Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import {IpContext} from '../contexts/IpContext';
import {beep2} from '../utils/ErrorList'
import DatePicker, {moment} from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import GetInt from '../utils/GetInt'
import GlobalFilter from '../utils/GlobalFilter'
import MobileContext from '../contexts/MobileContext'
import {format} from "date-fns"


export default function ContactGet (props)  {
  
    const [error, setError] = useState ('');
    const [stat, setStat] = useState()
    const [textArray, setTextArray] = useState();
    const navigate = useNavigate();

    // contact requests of last week
    const mili7DaysAgo = (Date.now() - 90 * 24 * 3600 * 1000) //** date 90 days back */
    const [searchDate, setSearchDate] = useState (new Date(mili7DaysAgo)); 
    const [months, setMonths] = useState();

    const [count, setCount] = useState(2); //** max msg count */
    const [beutify, setbeutify] = useState(true)
    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();
    const [searchText,setSearchText] = useState()
    
    const [logBackEnd, setLogBackEnd] = useState ();
    
    const LOG = props.logFlags.includes('contact')
    // const searchYear = searchDate.getFullYear();
    // const searchMon = searchDate.getMonth() + 1; // [1..12]
    // const searchDay = searchDate.getDate(); // [1..31]
    // const chartDateArr = [searchYear, searchMon, searchDay]

    useEffect (() => { 
      setTextArray()
      setStat()
  }, [beutify]) 


    // avoid loop
    function setLog () {
      setLogBackEnd (! logBackEnd)
    }

    //** Send request to backEnd server */
    function contactGet () {
        // console.log (getDate(), 'contactGet params', 'name=', nameRef.current.value, )
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
    
          corsUrl += corsServer+ ":" + PORT + "/contactGet?search";
          corsUrl += '&mili=' + searchDate.getTime(); 
          if (searchText)
            corsUrl += '&name=' + searchText
          if (count)
            corsUrl += '&count=' + count
          if (logBackEnd)
            corsUrl += '&LOG=true';

          const miliStart =  Date.now();

          setStat(' msg sent to server')
          setTextArray()
          setError()
          
          if (LOG)
            console.log (getDate(), 'url', corsUrl)
          axios.get (corsUrl)
          // getDate()
          .then ((result) => {
            if (result.status !== 200)
              return;
            const miliEnd =  Date.now()
            // const parsedList = JSON.parse(result.data)
            // console.log (getDate() +  ' msg sent')
            const latency = miliEnd - miliStart

            if (LOG)
              console.log (getDate(), 'Response:', result.data, 'latency=', latency, 'mili)'  )
            setStat( 'Contact-count=' + result.data.length + '  (latency=' + latency +' mili)' )
            
            if (beutify) {
              const txtArrModified = result.data
              for (let i = 0; i < txtArrModified.length; i++) {
                  txtArrModified[i].text = splitLines(txtArrModified[i].text)
              }
              setTextArray(txtArrModified) // display list of contact requests
            }
            else
              setTextArray(result.data)
          })
          .catch ((err) => {
          // setError([sym, 'email', err.message, corsUrl])
            console.log(getDate(), 'contact', err, corsUrl)
          })     
        };
      
        function splitLines (text) {
          if (Array.isArray(text)) 
            return text;
          const lineArray = text.split('_NL_')
          // console.log (lineArray)
          return (lineArray)
        }

        //** Set date of months back */
        const onOptionChangeDate = e => {
          const mon = e.target.value;
          setMonths(mon)
          var date = new Date();
          var formattedDate = format(date, "yyyy-MM-dd");
          var dateArray = formattedDate.split('-');
          const dateArray1 = monthsBack (dateArray, Number(mon));
          // setMonthsBack (months);
          const dateStr = dateArray1[0] + '-' + dateArray1[1] + '-' + dateArray1[2];
          setSearchDate (new Date(dateStr));
        }
      
        function swapBeutify () {
          setbeutify(! beutify)
        }

      return (
        <div style={{width:'100%', fontSize: '20px'}}>

          <h2 className='text-center mb-4'>Contact get</h2>
          &nbsp; <Link to="/" >Home</Link>
          {error && <Alert variant="danger"> {error} </Alert>}
          <hr/> 
          {/* <br/> */}
          <div>
    
            <GetInt init={count} callBack={setCount} title='getCount' type='Number' pattern="[0-9]+"/>    

            <div style={{display: 'flex'}}>
              <GlobalFilter className="stock_button_class" filter={searchText} setFilter={setSearchText} name='Search_name' isMobile={isMobile}/> &nbsp;  &nbsp;&nbsp;
              <input style={{marginTop: '15px'}} type="checkbox" checked={logBackEnd}  onChange={setLog} /> &nbsp;
              <label style={{marginTop: '15px'}}>LogBackEnd </label>
            </div>
            <div>&nbsp;</div>
            <input type="checkbox" checked={beutify} onChange={swapBeutify} /> beutify 
    
            {/* Choose start date */}
            <div  > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
                dateFormat="yyyy-LLL-dd" selected={searchDate} onChange={(date) => setSearchDate(date)} /> &nbsp; &nbsp;
            </div>

            <div style={{display: 'flex'}}>
              {/* Buttons for Quick set of start date */}
              <div>
                <input style={{marginLeft: '3px', width: '20px'}}  type="radio" name="mon" value='1' id='1' checked={months==='1'} onChange={onOptionChangeDate}/>
                <label style={{marginRight:'10px', paddingRight: '1px'}}> mon</label>         
              </div>
              <div>
                <input style={{marginLeft: '3px', width: '20px'}}  type="radio" name="mon" value='3' id='3' checked={months==='3'} onChange={onOptionChangeDate}/>
                <label style={{marginRight:'10px', paddingRight: '1px'}}> 3_mon</label>
              </div>
              <div>
                  <input style={{marginRight: '3px', width: '20px'}}  type="radio" name="mon" value='6' id='6' checked={months==='6'} onChange={onOptionChangeDate}/>
                  <label style={{marginRight:'10px', paddingRight: '1px'}}> 6_mon</label>
              </div>
              <div>
                  <input style={{marginRight: '2px', width: '20px'}}  type="radio" name="mon" value='12' id='12' checked={months==='12'} onChange={onOptionChangeDate}/>
                  <label style={{marginRight:'10px', paddingRight: '1px'}}> 1_Year</label>
              </div>
            </div>


          </div>

          
          <div>&nbsp;</div>
          <button onClick={() =>{contactGet()} } style={{backgroundColor:'lightGreen'}}> get contact requests</button>&nbsp;  
          
          <hr/> 

          <div>{stat}</div>
          <div>&nbsp;</div>
          {/* Display list of contactsUs. Split text lines _NL_  */}

            {! beutify && textArray && textArray.map((item,k) =>
              <li key={k}>date: {item.date} name: {item.name}, email: {item.email}, ip: {item.ip},
              city: {item.city}, region: {item.region}, country: {item.country}, os: {item.os}
              <div> {splitLines(item.text).map((t,j)=><div key={j}>{t}</div>)}</div> <div>&nbsp;</div></li>)}

       
           {beutify && textArray && textArray.map((item,k) =>
             {return (<li   key={k}> beutify && <pre>{JSON.stringify(item, null, 2)}</pre> </li>)}
            )}


        </div>
      );
    
    

}