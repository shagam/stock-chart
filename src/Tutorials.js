import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'

function Tutorials () {

    const [aboutFlag, setAboutFlag] = useState(false);
    // https://www.w3schools.com/cssref/pr_class_display.php
    return (
    <div>

        <div>
            <div className='w-100 text-left mt-2'>
                <Link to="/" > Home </Link>
            </div>
            <hr/> 
            <h4 style={{color:'Green'}}>Tutorials</h4>

            <hr/>
            <div style={{display: 'grid'}}>
                <div><a href="https://youtu.be/y3CBXkZzSNs" >Quick PortFolio Check </a>  &nbsp; &nbsp;  &nbsp; Compare Stocks & ETF </div>
                <div><a href="https://youtu.be/y3CBXkZzSNs" >Peak2Peak  </a>  &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;  &nbsp;         - long term yearly gain </div>
                <div><a href="https://youtu.be/y3CBXkZzSNs" >Drop recovery analysis</a>  &nbsp;  2008, 2021, 2022</div>
                <div><a href="https://youtu.be/y3CBXkZzSNs" >Common backend</a>  &nbsp; &nbsp;           get best stocks </div>
                <div><a href="https://youtu.be/y3CBXkZzSNs" >analyst-target-price</a>  &nbsp; &nbsp;   history of target-price</div>
                <div><a href="https://youtu.be/y3CBXkZzSNs" >Month gain</a>  &nbsp; &nbsp;  &nbsp; Months with highest gain </div> 

                <div><a href="https://youtu.be/y3CBXkZzSNs" >Table</a>  &nbsp; &nbsp;  &nbsp; Compare many </div> 
                <div><a href="https://youtu.be/y3CBXkZzSNs" >Chart</a>  &nbsp; &nbsp;  &nbsp; Compare few </div> 

                <div><a href="https://youtu.be/y3CBXkZzSNs" >Verify-1</a>  &nbsp; &nbsp;  &nbsp; Compare with MarketWatch historical price</div> 
                <div><a href="https://youtu.be/y3CBXkZzSNs" >raw data</a>  &nbsp; &nbsp; Show raw data, as received </div>
                
                <hr/>
                <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp; 
                <a href="https://youtu.be/Rv5a0tkMISE" >Hebrew tutorial</a> &nbsp; &nbsp; 
                
                <hr/>
                <div>Link to the tool: <a href="https://stocks-compare.netlify.app" >Stocks Protfolio, Analyze & compare</a> </div> 

            </div>
            <hr/> 

        </div>


    </div>
    )}

    export default Tutorials