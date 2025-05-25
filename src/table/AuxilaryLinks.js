import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
import {IpContext} from '../contexts/IpContext';

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
          <div>
            <div>&nbsp;</div>
            <div>Aux</div>
            <button role="link" onClick={() => openInNewTab("https://www.crews.bank/blog/charts/stocks-for-the-long-run")}> stocks gain - long run </button> &nbsp;      
            {<button role="link" onClick={() => openInNewTab(globalTechUrl)}> globalTech (Israeli mix) </button>} &nbsp; 
        </div>

        <div>&nbsp;</div>
        <div>
            <div>Politician trading</div>
            {<button role="link" onClick={() => openInNewTab('https://www.quiverquant.com')}>Quiver-trade</button>} &nbsp;  
            {<button role="link" onClick={() => openInNewTab('https://www.capitoltrades.com/trades')}> Capitol-trade</button>}
        </div>

        <div>&nbsp;</div>
        <div>
            <div>Stock market info</div>
            {<button role="link" onClick={() => openInNewTab('https://www.google.com/finance/quote/QQQ:NASDAQ')}> google-finance qqq</button>} &nbsp;
            {<button role="link" onClick={() => openInNewTab('https://finance.yahoo.com/quote/QQQ/')}> yahoo-finance qqq</button>} &nbsp;
            {<button role="link" onClick={() => openInNewTab('https://www.barchart.com/etfs-funds/quotes/qqq')}> barchart qqq</button>} &nbsp;
            </div>

        <div>&nbsp;</div>
        <div>
            {<button role="link" onClick={() => openInNewTab('https://bigcharts.marketwatch.com/historical/default.asp?symb=qqq')}>bigchart.marketwatch qqq</button>} &nbsp; 
            {<button role="link" onClick={() => openInNewTab('https://www.nasdaq.com/market-activity/etf/qqq/after-hours')}>nasdaq qqq</button>} &nbsp; 
            {/* {<button role="link" onClick={() => openInNewTab('https://www.cnbc.com/markets/')}>cnbc</button>} &nbsp;  */}
            {<button role="link" onClick={() => openInNewTab('https://www.cnbc.com/quotes/QQQ?qsearchterm=qqq')}>cnbc qqq</button>} &nbsp; 
                    
        </div>

        <div>&nbsp;</div>
        <div>
            <div>Crypto</div>
            {<button role="link" onClick={() => openInNewTab('https://coinmarketcap.com/')}>Crypto list</button>} &nbsp;         
            {/* {<button role="link" onClick={() => openInNewTab('https://coinmarketcap.com/currencies/bitcoin/')}>bitcoin</button>} &nbsp; 
            {<button role="link" onClick={() => openInNewTab('https://coinmarketcap.com/currencies/ethereum//')}>iterium</button>} &nbsp;           */}
            {/* {<button role="link" onClick={() => openInNewTab('https://calendar.bitbo.io/price/')}>bitcoin</button>} &nbsp;   */}
            {<button role="link" onClick={() => openInNewTab('https://finance.yahoo.com/quote/BTC/')}>BTC bitcoin ETF</button>} &nbsp;           
        </div>

     <div >
            {/* <a href="https://www.google.com/search?q=vix">VIX</a> &nbsp; */}
            {/* <a href="https://finance.yahoo.com/quote/%5EVIX/">VIX </a> &nbsp; */}
            <div>&nbsp;</div>
            <div>Volatility</div>
            <button role="link" onClick={() => openInNewTab("https://finance.yahoo.com/quote/%5EVIX/")}> VIX </button> &nbsp;
            <button role="link" onClick={() => openInNewTab("https://www.google.com/search?q=VIXY")}> VIXY </button> &nbsp;
            <button role="link" onClick={() => openInNewTab("https://www.google.com/search?q=UVXY")}> UVXY </button> &nbsp;
            <button role="link" onClick={() => openInNewTab("https://finance.yahoo.com/quote/%5EVXO/")}> VXO </button> &nbsp;

        </div>

        <hr/> 

    </div>
    )}

    export default AuxilaryLinks