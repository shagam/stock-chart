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
                <div><a href="https://youtu.be/nywx9EncRo0" >Quick PortFolio Check</a>  &nbsp;  Compare Stocks & ETF </div>
                <div><a href="https://youtu.be/XHf5oYnegdQ" >Common backend</a>  &nbsp; &nbsp;           Get best stocks </div>

                <div><a href="https://youtu.be/LwBOtJOIxco" >Peak2Peak  </a>  &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;          long term yearly gain </div>
                <div><a href="https://youtu.be/MsJtdrBnLB8" >Drop recovery</a>  &nbsp; Analyse drops of 2008, 2021, 2022</div>


                {/* <div><a href="https://youtu.be/y3CBXkZzSNs" >Table</a>  &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;   Compare many </div>  */}
                <div><a href="https://youtu.be/2uUit4pmY7o" >Chart</a>  &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;   Compare few </div> 

                <div><a href="https://youtu.be/0sZ0QK1nwHo" >Month gain</a>  &nbsp; &nbsp;  &nbsp; Months with highest gain </div> 
                <div><a href="https://youtu.be/IElQqHTVPnE" >Analyst-target-price</a>  &nbsp; &nbsp;   History of target-price</div>


                <div><a href="https://youtu.be/n_NXoU5ce-A" >Raw data</a>  &nbsp; &nbsp;  &nbsp; &nbsp;Show raw data, as received </div>
                <div><a href="https://youtu.be/cVxKLW3pPB0" >Persistance</a>  &nbsp; &nbsp; Stock info saved in localStorage </div>
                <div><a href="https://youtu.be/IR3TBJlqM_g" >Verify-1</a>  &nbsp; &nbsp;  &nbsp;  &nbsp; &nbsp; Compare with MarketWatch historical price</div> 

                <hr/>
                {/* <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp;  */}
                <a href="https://youtu.be/Rv5a0tkMISE" >Hebrew tutorial</a> &nbsp; &nbsp; 
                
                <hr/>
                <div>Link to the tool: <a href="https://stocks-compare.netlify.app" >Stocks Protfolio, Analyze & compare</a> </div> 

            </div>
            <hr/> 

        </div>


    </div>
    )}

    export default Tutorials