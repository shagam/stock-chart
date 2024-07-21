import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
import IpContext from '../contexts/IpContext';

const globalTechUrl = 'https://www.as-invest.co.il/media/tdmprbse/%D7%9E%D7%A1%D7%9C%D7%95%D7%9C-%D7%9E%D7%9E%D7%95%D7%A7%D7%93-%D7%97%D7%95%D7%9C-%D7%A4%D7%90%D7%A1%D7%99%D7%91%D7%99-%D7%9E%D7%93%D7%93%D7%99-%D7%9E%D7%A0%D7%99%D7%95%D7%AA_global-tech.pdf'


const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
};


function AuxilaryLinks () {

    const {localIp, localIpv4, eliHome, city, countryName, countryCode,} = IpContext();

    // https://www.w3schools.com/cssref/pr_class_display.php
    return (
    <div>

        <div className='w-100 text-left mt-2'>
            <Link to="/" > Home </Link>
        </div>
        <hr/> 
        <h4 style={{color:'Green'}}>Auxilary links</h4>
        <hr/>

        {/* <div className='w-100 text-left mt-2' style={{color:'magenta'}}>
           <h5> &nbsp; Start with The first tutorial. (lasts 2.5 minutes.) </h5>
           <h5> &nbsp; Most other tutorials lasts around one minute </h5>
        </div>          */}

        {/* <hr/> */}
        <div >
            {/* <a href="https://www.google.com/search?q=vix">VIX</a> &nbsp; */}
            {/* <a href="https://finance.yahoo.com/quote/%5EVIX/">VIX </a> &nbsp; */}
            <button role="link" onClick={() => openInNewTab("https://finance.yahoo.com/quote/%5EVIX/")}> VIX </button> &nbsp;
            <button role="link" onClick={() => openInNewTab("https://www.crews.bank/blog/charts/stocks-for-the-long-run")}> stocks gain - long run </button> &nbsp;      
            {<button role="link" onClick={() => openInNewTab(globalTechUrl)}> globalTech </button>}

        </div>
        <hr/> 

    </div>
    )}

    export default AuxilaryLinks