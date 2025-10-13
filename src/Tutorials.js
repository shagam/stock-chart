import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
import MobileContext from './contexts/MobileContext'
import { ComboBoxSelect } from './utils/ComboBoxSelect'
import {IpContext, getIpInfo} from './contexts/IpContext';
import GetInt from './utils/GetInt'


const language = false
const tutorialArray = [
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/29TnD1h8ZPs',
        name:         'Bubble-line',
        description:  'Stock market bubble. Can we predict future crash? ',  
    },
    // {
    //     condition: language,
    //     link:         'https://youtu.be/Rv5a0tkMISE',
    //     name:         'Hebrew tutorial',
    //     description:  "",
    // },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/C0UjQWHWbB8',
        name:         'Drop-recovery',
        description:  'Analyse drops and recovery 2008, 2020, 2022 ',
    },
    {
        condition: ! language,
        link:         ' https://youtube.com/shorts/YnNDCs4sUyA',
        name:         'Call-options',
        description:  'Analyse call options, expected yield',
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/jlFlJfKPGrE',
        name:         'ETF-Holdings',
        description:  'ETF holdings review and compare ETFs',
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/hjxdWTGohAc',
        name:         'Common DataBase',
        description:  'Stocks with 2x gain higher than QQQ: 1Yr, 2Yr, 5Yr, 10Yr',
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/zQdRjpuYkjA',
        name:         'Month-gain',
        description:  "Is there a systematic difference between month's gain",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/ziRLU3XPJRY?feature=share',
        name:         'Trade-simulator',
        description:  "Can we beat the gain of QQQ, just by trading QQQ?",
    },
    {
        condition: true,
        link:         null,
        name:         '====',
        description:  null,
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/12oKOXv0gqA',
        name:         'Table-view',
        description:  "Compare many stocks & ETF, (sort/filter/select column)",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/11RweD4QKnI',
        name:         'Chart-view',
        description:  "Compare a few stocks",
    },
    {
        condition: true,
        link:         null,
        name:         '====',
        description:  null,
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/AK38qRao-TE',
        name:         'Price-alert (group)',
        description:  "Compare selected stocks closing price with highest price",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/9n_nQuhbeFc',
        name:         'Price-alert (specific stock)',
        description:  "Compare price of stock with threshold ",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/UOtcApd5XOY',
        name:         'Rise-drop-frequency',
        description:  "How often is there a 5%, price rise or drop?",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/h2sE1njL4iw',
        name:         'Moving-average',
        description:  "May be used for predicting market trend",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/jSlOyfLPMZc',
        name:         'CandleSticks',
        description:  "Popular prediction mechanism",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/FgYGr5KcJe0',
        name:         'Analyst-target-price',
        description:  "History of analyst-target-price prediction (average of many)",
    },
    {
        condition: true,
        link:         null,
        name:         '====',
        description:  null,
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/S_eBgij72Zk',
        name:         'stock-lists',
        description:  "Save & Share stock-list between users",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/w0qQc_Ue_jw',
        name:         'Verify_1',
        description:  "Verify historical price. Compare with other sites",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/BpC7wK7Psvw',
        name:         'Raw data',
        description:  "Raw historical stock prices, received from AlphaVantage",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/k5CbJD8cIAA',
        name:         'Persistance',
        description:  "Stock info saved in localStorage",
    },
    {
        condition: true,
        link:         null,
        name:         '====',
        description:  null,
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/rxrcge4LsIc',
        name:         'Berkshire-Hathaway',
        description:  "BRK-B gain compared with S&P anf QQQ",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/6tbGbdvEvt0',
        name:         'Leverage-hightech-etf',
        description:  "Short term profit example, using tripple-hitech",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/6F06FI6mdG8',
        name:         'Is QQQ better than SPY',
        description:  "During the last year - same holdings for both",
    },
    {
        condition: ! language,
        link:         'https://youtube.com/shorts/ul_LzUeENd4',
        name:         'Market-crash-hint',
        description:  "Bubble-line proximety can hint for market crash",
    },
    {
        condition: true,
        link:         null,
        name:         '====',
        description:  null,
    },
    {
        condition: ! language,
        link:         'https://youtube.com/playlist?list=PLBwPhbE_paAyMgNmnnkCjUYloLcAIy6ks&feature=shared',
        name:         'Tutorial Playlist',
        description:  "Serialized tutorials",
    },
    {
        condition:  language,
        link:         'https://youtu.be/Rv5a0tkMISE',
        name:         'Hebrew tutorial',
        description:   "Hebrew tutorial",
    },
    {
        condition:    language,
        link:         'https://www.veed.io/view/df28ebf3-2a6c-4ac8-81f4-1ab9ca3f33c4?panel=share',
        name:         'Bubble-line (Heb)',
        description:  " קו-הבועות בעברית",
    },
    {
        condition: language,
        link:         'https://www.veed.io/edit/e848e95a-0131-49b4-9114-5c0f3f9c19c0/video',
        name:         'Laverage ETF (Heb)',
        description:  "Short term gain trading TQQQ (Hebrew)",
    },
    {
        condition:   true,
        link:         null,
        name:         '====',
        description:  null,
    },
    {
        condition: ! language,
        link:         'https://stocks-compare.netlify.app',
        name:         'Stocks-compare',
        description:  "Link for the tool",
    },


]



function Tutorials () {
    const {eliHome} = IpContext();
    const [aboutFlag, setAboutFlag] = useState(false);
    const {isMobile} = MobileContext();
    const [mobile, setMobile]  = useState(isMobile);
    const [language, setLanguage] = useState(false);
    const [searchText, setSearchText] = useState('');
    // https://www.w3schools.com/cssref/pr_class_display.php

    const languageList = ['English', 'Hebrew']
    const platformList = ['Desktop', 'Mobile']
    return (
    <div>

        <div className='w-100 text-left mt-2'>
            <Link to="/" > Home </Link>
        </div>
        <hr/> 
        <h4 style={{color:'Green'}}>Tutorials</h4>

        <div className='w-100 text-left mt-2' style={{color:'magenta'}}>
           {/* <h5> &nbsp; Start with The first tutorial. (lasts 2.5 minutes.) </h5> */}
           <h5> &nbsp; Most tutorials lasts around 1 minute </h5>

            {/* {eliHome && <div style={{display:'flex'}}> <ComboBoxSelect serv={language} nameList={languageList} setSelect={setLanguage} title='backEnd' options={languageList} defaultValue={language}/> &nbsp;&nbsp;</div>}  */}
            <div style={{display: 'flex'}}>
                <ComboBoxSelect serv={language} nameList={languageList} setSelect={setLanguage} title='' TITLE='Choose language ' options={[false,true]} defaultValue={false} /> &nbsp; &nbsp; &nbsp;&nbsp;
                {/* <ComboBoxSelect serv={mobile} nameList={platformList} setSelect={setMobile} title='' TITLE='Mobile or desktop ' options={[false,true]} defaultValue={false} /> &nbsp; */}
                {eliHome && <GetInt init={searchText} callBack={setSearchText} title='search/Filter  &nbsp;' type='text' pattern="[0-9_a-zA-Z\\.]+" width = '35%'/>}
                <hr/> 
            </div>
        </div>         

        {/* <hr/> */}
        <div >
            <table>
                <tbody> 
                      {tutorialArray.map((item, index) => {
                        return ((!searchText || ! item.description || ! item.name ||
                        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchText.toLowerCase())) && (language !== item.condition)               
                    ) && 
                        <tr key={index} >
                            <td>
                                { <a href={item.link}><b>{item.name}</b> </a>}
                            </td>
                            <td>{item.description}</td>
                        </tr>
                      })}
                </tbody>
            </table>

            {/* <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp;  */}

        </div>
        <hr/> 

    </div>
    )}

    export default Tutorials