import React, { useState, useRef } from 'react'
import { Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'
import IpContext from '../contexts/IpContext';
import {beep2} from '../utils/ErrorList'
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

    // contact requests of last week
    const mili7DaysAgo = (Date.now() - 7 * 24 * 3600 * 1000)
    const [searchDate, setSearchDate] = useState (new Date(mili7DaysAgo)); 

    const [count, setCount] = useState(5);

    const {userAgent, userAgentMobile, isAndroid, isIPhone, isMobile} = MobileContext();

    const [searchType, setSearchType] = useState()
    const [searchText,setSearchText] = useState()

    // const searchYear = searchDate.getFullYear();
    // const searchMon = searchDate.getMonth() + 1; // [1..12]
    // const searchDay = searchDate.getDate(); // [1..31]
    // const chartDateArr = [searchYear, searchMon, searchDay]
 
    
    const onOptionChange = e => {
      const tool = e.target.value;
      setSearchType(tool)
      console.log(tool)
    }

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

          const miliStart =  Date.now();

          setStat(' msg sent to server')
          setTextArray()
          setError()

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

            console.log (getDate(), 'Response:', result.data, 'latency=', latency, 'mili)'  )
            setStat( 'Contact-count=' + result.data.length + '  (latency=' + latency +' mili)' )
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
      
        function splitLines (text) {
          const lineArray = text.split('_NL_')
          // console.log (lineArray)
          return (lineArray)
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


            <GlobalFilter className="stock_button_class" filter={searchText} setFilter={setSearchText} name='Search_name' isMobile={isMobile}/> 


            <div>&nbsp;</div>
    
            <div  > StartDate:&nbsp; <DatePicker style={{ margin: '0px', size:"lg"}} 
                dateFormat="yyyy-LLL-dd" selected={searchDate} onChange={(date) => setSearchDate(date)} /> &nbsp; &nbsp; </div>
            </div>

           
            <div>&nbsp;</div>
            <button onClick={() =>{contactGet()} } style={{backgroundColor:'lightGreen'}}> get contact requests</button>&nbsp;  
            
            <hr/> 

            <div>{stat}</div>
            <div>&nbsp;</div>
            {textArray && textArray.map((item,k) =>
               <li key={k}>date: {item.date} name: {item.name}, email: {item.email}, city: {item.city}, country: {item.countryName}
                <div> {splitLines(item.text).map((t,j)=><div key={j}>{t}</div>)}</div> <div>&nbsp;</div></li>)}
               
            
        </div>
      );
    
    

}