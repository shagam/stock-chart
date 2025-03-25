import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
import MobileContext from './contexts/MobileContext'
import { ComboBoxSelect } from './utils/ComboBoxSelect'
import {IpContext, getIpInfo} from './contexts/IpContext';

function Tutorials () {
    const {eliHome} = IpContext();
    const [aboutFlag, setAboutFlag] = useState(false);
    const {isMobile} = MobileContext();
    const [mobile, setMobile]  = useState(isMobile);
    const [language, setLanguage] = useState(false);
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
           <h5> &nbsp; Most tutorials lasts less than 2 minute </h5>

            {/* {eliHome && <div style={{display:'flex'}}> <ComboBoxSelect serv={language} nameList={languageList} setSelect={setLanguage} title='backEnd' options={languageList} defaultValue={language}/> &nbsp;&nbsp;</div>}  */}
            <div style={{display: 'flex'}}>
                <ComboBoxSelect serv={language} nameList={languageList} setSelect={setLanguage} title='' TITLE='Choose language ' options={[false,true]} defaultValue={false} /> &nbsp;
                {/* <ComboBoxSelect serv={mobile} nameList={platformList} setSelect={setMobile} title='' TITLE='Mobile or desktop ' options={[false,true]} defaultValue={false} /> &nbsp; */}
            </div>
        </div>         

        {/* <hr/> */}
        <div >
            <table>
                <tbody>              
                    {/* {! language && <tr>
                        <td><a href="https://youtu.be/jibwwWP0OVQ">Introduction </a></td><td>Compare Stocks & ETF (PortFolio Check)</td> 
                    </tr>}                  */}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/29TnD1h8ZPs"><b>Bubble-line</b> </a></td><td>Stock market bubble. Can we predict future crash? </td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/C0UjQWHWbB8"><b>Drop-recovery</b></a></td><td>Analyse drops and recovery 2008, 2020, 2022 </td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/jlFlJfKPGrE"><b>ETF-Holdings</b></a></td><td>ETF holdings review and compare ETFs</td> 
                    </tr>}

                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/hjxdWTGohAc"><b>Common DataBase</b>  </a></td><td>
                             Stocks with 2x gain higher than QQQ: 1Yr, 2Yr, 5Yr, 10Yr</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/ziRLU3XPJRY?feature=share"><b>Trade-simulator</b></a></td><td>Can we beat the gain of QQQ, just by trading QQQ?</td> 
                    </tr>}
                    {/* {! language && <tr>
                        <td><a href="https://youtu.be/xbGUpEGu5sI">Leverage_ETF</a></td><td>Strategy for short term gain on Leverage_ETF like TQQQ</td> 
                    </tr>} */}
                    {/* {! language && <tr>
                        <td><a href="https://youtu.be/73G9GTQRddk">Is QQQ better than SPY</a></td><td>During the last year - same holdings for both</td> 
                    </tr>} */}
                    {/* {! language && <tr>
                        <td><a href="https://youtu.be/UM2J5eWzZfI">Drop_rise_count</a></td><td>Frequency of drops may be used for trading Leverage-ETF</td> 
                    </tr>} */}

                           
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/12oKOXv0gqA"><b>Table-view</b></a></td><td>Compare many stocks & ETF, (sort/filter/select column)</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/11RweD4QKnI"><b>Chart-view</b></a></td><td>Compare a few stocks</td> 
                    </tr>}
                    
                    <div>&nbsp;</div>
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/AK38qRao-TE"><b>Price-alert (group)</b></a></td><td>Compare selected stocks closing price with highest price</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/9n_nQuhbeFc"><b>Price-alert (specific stock)</b></a></td><td>Compare price of stock with threshold </td> 
                    </tr>}                 
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/UOtcApd5XOY"><b>Rise-drop-frequency</b></a></td><td>How often is there a 5%, price rise or drop?</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/h2sE1njL4iw"><b>Moving-average</b></a></td><td>May be used for predicting market trend</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/jSlOyfLPMZc"><b>CandleSticks</b></a></td><td>Popular prediction mechanism</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/FgYGr5KcJe0"><b>Analyst-target-price</b></a></td><td>History of analyst-target-price prediction (average of many)</td> 
                    </tr>}

                    
                    <div>&nbsp;</div>
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/S_eBgij72Zk"><b>stock-lists</b></a></td><td>Save & Share stock-list between users</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/w0qQc_Ue_jw"><b>Verify_1</b></a></td><td>Verify historical price. Compare with other sites</td> 
                    </tr>}
                          {! language && <tr>
                        <td><a href="https://youtube.com/shorts/BpC7wK7Psvw"><b>Raw data</b></a></td><td>Raw historical stock prices, received from AlphaVantage</td> 
                    </tr>}
                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/Z-YxEWlq94o"><b>Persistance</b></a></td><td>Stock info saved in localStorage</td> 
                    </tr>}

                    {! language && <tr>
                        <td><a href="https://youtube.com/shorts/rxrcge4LsIc"><b>Berkshire-Hathaway</b> </a></td><td>BRK-B gain compared with S&P anf QQQ</td> 
                    </tr>}
            

                    <tr>
                       <div>&nbsp;</div>
                    </tr>
                    {! language && <tr>
                        <td><a href="https://youtube.com/playlist?list=PLBwPhbE_paAyMgNmnnkCjUYloLcAIy6ks&feature=shared"> <b>Tutorial Playlist</b></a></td><td>Serialized tutorials</td> 
                    </tr>}

                    {<tr>
                       <div>&nbsp;</div>
                    </tr>}
                    {/* {language &&  <tr>
                        <td><a href="https://youtu.be/Rv5a0tkMISE">Hebrew tutorial</a></td><td></td>        
                    </tr>} */}



                    {language && <tr>
                        <td><a href="https://www.veed.io/view/df28ebf3-2a6c-4ac8-81f4-1ab9ca3f33c4?panel=share"><b>Bubble-line (Heb)</b></a></td> קו-הבועות בעברית<td></td>        
                    </tr>}     
                    {language && <tr>
                        <td><a href="https://www.veed.io/edit/e848e95a-0131-49b4-9114-5c0f3f9c19c0/video"><b>Laverage ETF (Heb)</b></a></td> Short term gain trading TQQQ (Hebrew)<td></td>        
                    </tr>}                

                    <tr>
                       <div>&nbsp;</div>
                    </tr>                    
                    <tr>
                        <td><a href="https://stocks-compare.netlify.app">Stocks-compare</a></td><td>Link for the tool</td> 
                    </tr>

                </tbody>
            </table>

            {/* <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp;  */}

        </div>
        <hr/> 

    </div>
    )}

    export default Tutorials