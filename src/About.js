import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'

function About () {

    // const [aboutFlag, setAboutFlag] = useState(false);
const  col='#765739'// 'magenta
return (
<div>
    <div>
        <Link to="/" > Home </Link>
    </div>
    <div>
    
    <hr/> 
    <h4 style={{color:'Green'}}>About  </h4>
    <hr/> 
    <h5> Analyse and compare stocks / ETF, in the US stock market,</h5> 
    {/* <h5  style={{color:'red'}}> for long term investors.  </h5> */}


    <table>
        <tbody>
            <tr>
                <td style={{color:'magenta'}}>  Long term<br></br> yearly growth </td><td>from the peak before the 2008 deep, to the peak before 2022 deep. (peak2Peak)  </td> 
            </tr>
            <tr>
                <td>  </td><td style={{display:'flex'}}> Hi-Tech NASDAQ ETF - QQQ average annual gain <div style={{color:'red'}}>&nbsp; 15%</div></td> 
            </tr>
            <tr>
                <td>  </td><td  style={{display:'flex'}}> S&P 500 - average annual gain, about <div style={{color:'red'}}>&nbsp; 11%</div>.</td> 
            </tr>


            <tr>
                <td style={{color:'magenta'}}>Drop recovery </td><td>calculate the drop level, and recovery period. 2008, 2021,2022</td> 
            </tr>
            
            <tr>
                <td style={{color:'magenta'}}>Table  </td><td>Compares a many stocks </td> 
            </tr>
            <tr>
                <td style={{color:'magenta'}}>Chart </td><td>Compares a few stocks </td> 
            </tr>
            
            <tr>
                <td style={{color:'magenta'}}>Common database</td><td> Get Stocks preformed better than QQQ Year, 2Year, 5Year, 10Year <br></br> (from select list) </td> 
            </tr>
            <tr>
                <td style={{color:'magenta'}}>Monthly gain</td><td>  November has the best gain </td> 
            </tr>
            
            <tr>
                <td style={{color:'magenta'}}>Analyst target price</td><td>Not sure, Just started collecting results</td> 
            </tr>
            <tr>
                <td style={{color:'magenta'}}>Historical stock prices</td><td>Recieved from AlphVatage.co</td> 
            </tr>
            <tr>
                <td style={{color:'magenta'}}>Verify</td><td>Compare with MarketWatch</td> 
            </tr>
            
            <tr>
                <td style={{color:'magenta'}}>Free sharing</td><td>Pease share with anyone interested</td> 
            </tr>
            <tr>
                <td style={{color:'magenta'}}>Public source code</td><td>github.com/shagam</td> 
            </tr>
            <tr>
                <td style={{color:'magenta'}}>No garentee </td><td>Please compare with other sites</td> 
            </tr>


        </tbody>
    </table>

  

     <hr/> 

    {/* <h6> Wisdom of the crowd </h6> */}
    {/* <hr/>  */}
    {/* <h6>Source -  github.com/shagam/stock-chart </h6> */}

    {/* <h6>Written in ReactJS, on top of JavaScript.</h6>  */}
    <hr/> 
    </div>

    </div>   
)}

export default About