import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
import MobileContext from './contexts/MobileContext'

function Tutorials () {

    const [aboutFlag, setAboutFlag] = useState(false);
    const {isMobile} = MobileContext();
    // https://www.w3schools.com/cssref/pr_class_display.php
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
        </div>         

        {/* <hr/> */}
        <div >
            <table>
                <tbody>              
                    <tr>
                        <td><a href="https://youtu.be/jibwwWP0OVQ">Introduction </a></td><td>Compare Stocks & ETF (PortFolio Check)</td> 
                    </tr>                 
                    {/* "https://youtu.be/AMrNSLRRuxY" */}
                    <tr>
                        <td><a href="https://youtu.be/aLYaMStQVds">Peak2Peak</a></td><td>How to measure long term yearly gain of an ETF</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/xXB-dzEKAus">Bubble-line </a></td><td>Stock market bubble. Can we predict future crash? </td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/F458c7qZx2k">Drop-recovery</a></td><td>Analyse drops and recovery 2008, 2020, 2022 </td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/Yk6fj_peDlM">ETF-Holdings</a></td><td>ETF holdings review and compare ETFs</td> 
                    </tr>

                    <tr>
                        <td><a href="https://youtu.be/957Dwf29JfA">Common DataBase  </a></td><td>
                             Stocks gains higher than QQQ: 1Yr, 2Yr, 5Yr, 10Yr</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/BMFbtrOyRz8">Month-gain</a></td><td>Is there a systematic difference between month's gain</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/xbGUpEGu5sI">Leverage_ETF</a></td><td>Strategy for short term gain on Leverage_ETF like TQQQ</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/73G9GTQRddk">Is QQQ better than SPY</a></td><td>During the last year - same holdings for both</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/UM2J5eWzZfI">Drop_rise_count</a></td><td>Frequency of drops may be used for trading Leverage-ETF</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/XjNCqdMoEws">Price-drop-alert</a></td><td>Compare selected stocks closing price with highest price</td> 
                    </tr>

                    

                    <tr>
                        <td><a href="https://youtu.be/faEcqp7PIfw">Table-view</a></td><td>Compare many stocks & ETF</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/MoOBqUHw3Xo">Chart-view</a></td><td>Compare a few stocks</td> 
                    </tr>

                    <tr>
                        <td><a href="https://youtu.be/IG7rc-0JHMM">Trade-simulator</a></td><td>Can we beat the gain of QQQ, just by trading QQQ?</td> 
                    </tr>


                    <tr>
                        <td><a href="https://youtu.be/maU-gq6iCqA">Stock-lists</a></td><td>Share stock-list</td> 
                    </tr>

                    <tr>
                        <td><a href="https://youtu.be/-AFWK_7RK1s">Future-contracts</a></td><td> Can they hint on market trend</td> 
                    </tr>         


                    <tr>
                        <td><a href="https://youtu.be/IR3TBJlqM_g">Verify_1</a></td><td>Verify historical price. Compare with another site</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/IElQqHTVPnE">Analyst-target-price</a></td><td>History of target-price prediction</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/n_NXoU5ce-A">Raw data</a></td><td>Raw historical stock prices, received from AlphaVantage</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/cVxKLW3pPB0">Persistance</a></td><td>Stock info saved in localStorage</td> 
                    </tr>

                    <tr>
                        <td><a href="https://youtu.be/HZIrT91hj0o">Berkshire-Hathaway </a></td><td>BRK-B gain compared with S&P anf QQQ</td> 
                    </tr>

                    

                    <tr>
                       <div>&nbsp;</div>
                    </tr>
                    <tr>
                        <td><a href="https://youtube.com/playlist?list=PLBwPhbE_paAyMgNmnnkCjUYloLcAIy6ks&feature=shared">Tutorial Playlist</a></td><td>Serialized tutorials</td> 
                    </tr>

                    <tr>
                       <div>&nbsp;</div>
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/Rv5a0tkMISE">Hebrew tutorial</a></td><td></td>        
                    </tr>
                    <tr>
                        <td><a href="https://www.veed.io/edit/e848e95a-0131-49b4-9114-5c0f3f9c19c0/video">Laverage ETF (Heb)  </a></td> Short term gain trading TQQQ (Hebrew)<td></td>        
                    </tr>
                    

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