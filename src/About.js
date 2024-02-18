import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'

function About () {

    // const [aboutFlag, setAboutFlag] = useState(false);

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


      <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}> Long term yearly growth </h6> <h6> &nbsp; - (peak2Peak) from the peak before the 2008 deep, to the peak before 2022 deep  . </h6>
    </div>

    <h6>  &nbsp; &nbsp; Hi-Tech NASDAQ ETF (QQQ) - average annual gain of 15%. </h6>
    <h6>   &nbsp; &nbsp; S&P 500 - average annual gain of about 10%. </h6>
    
    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>  Drop recovery analysis </h6> <h6> &nbsp; - calculate the drop level, and recovery period. </h6>
    </div>

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>  </h6> <h6> &nbsp; &nbsp; 2008  QQQ  drops 53%, recovered within 3 years. </h6>
        <h6>,   2022  QQQ  Drops 36%,  almost recovered within 2 years   . </h6>
    </div>

    {/* <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>volatility </h6> <h6> &nbsp; During deep periods, Hi-Tech drop 50% more than S&P. However Hi-Tech grows more during bear market.  </h6>
    </div> */}

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}> Chart </h6> <h6> &nbsp; Compares a few stocks, yearly_gain, zoom, date range, logarithmic. </h6>
    </div>

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}> Table </h6> <h6> &nbsp; Compare many stocks, yearly_gain, column sort, column-hide, filter, basic stock info . </h6>
    </div>

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}> Get best </h6> <h6> &nbsp; Stocks preformed better than QQQ Year, 2Year, 5Year, 10Year (from select list)</h6>
    </div>

    {/* <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>Price / high </h6> <h6> &nbsp; Compare today price with high before deep. (How far from recovery) </h6>
    </div> */}

    {/* <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>Data sharing </h6> <h6> &nbsp; Through a common Firebase </h6>
    </div> */}

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>Monthly gain </h6> <h6> &nbsp; November has the best gain </h6>
    </div>

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}>Analyst target price </h6> <h6> &nbsp; Just started collecting results.  </h6>
    </div>

    {/* <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}> Target price </h6> <h6> &nbsp; - based an many analysts prediction. Value above 1 means stock price expcted to rise. </h6>
    </div> */}

    <div style={{display:'flex'}} >
        <h6 style={{color:'red'}}> AlphVatage.co </h6> <h6> &nbsp; Analysis based on Historical stock prices</h6>
    </div>
    
    <div style={{display:'flex'}}>
        <h6 style={{color:'red'}}> Free sharing </h6> <h6>&nbsp; Pease share with anyone interested </h6>
    </div>

    <hr/> 

    {/* <h6> Wisdom of the crowd </h6> */}
    {/* <hr/>  */}
    <h6>Source -  github.com/shagam/stock-chart </h6>

    {/* <h6>Written in ReactJS, on top of JavaScript.</h6>  */}
    <hr/> 
    </div>

    </div>   
)}

export default About