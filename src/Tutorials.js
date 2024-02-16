import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'

function Tutorials () {

    const [aboutFlag, setAboutFlag] = useState(false);
    // https://www.w3schools.com/cssref/pr_class_display.php
    return (
    <div>

        <div className='w-100 text-left mt-2'>
            <Link to="/" > Home </Link>
        </div>
        <hr/> 
        <h4 style={{color:'Green'}}>Tutorials</h4>

        {/* <hr/> */}
        <div >
            <table>
                <tbody>
                    <tr>
                        <td><a href="https://youtu.be/nywx9EncRo0">Quick PortFolio Check</a></td><td>Compare Stocks & ETF</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/LwBOtJOIxco">Peak2Peak  </a></td><td>long term yearly gain </td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/MsJtdrBnLB8">Drop recovery</a></td><td>Analyse drops of 2008, 2021, 2022 </td> 
                    </tr>
                    
                    <tr>
                        <td><a href="https://youtu.be/_iDuaiZP7hg">Table mechanizm</a></td><td>Compare many stocks & ETF</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/2uUit4pmY7o">Chart mechanizm</a></td><td>Compare a few stocks</td> 
                    </tr>
                    <tr>

                        <td><a href="https://youtu.be/0sZ0QK1nwHo">Month gain</a></td><td>Months with highest gain</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/IElQqHTVPnE">Analyst-target-price</a></td><td>History of target-price</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/n_NXoU5ce-A">Raw data</a></td><td>Show raw data, as received</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/cVxKLW3pPB0">Persistance</a></td><td>Stock info saved in localStorage</td> 
                    </tr>
                    <tr>
                        <td><a href="https://youtu.be/IR3TBJlqM_g">Verify</a></td><td>Compare with MarketWatch historical price</td> 
                    </tr>
                    <tr>
                        <td><a href="https://stocks-compare.netlify.app">Protfolio Stocks compare</a></td><td>Link to the tool</td> 
                    </tr>
                </tbody>
            </table>

            {/* <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp;  */}
            {/* <a href="https://youtu.be/Rv5a0tkMISE" >Hebrew tutorial</a> &nbsp; &nbsp;  */}         

        </div>
        <hr/> 

    </div>
    )}

    export default Tutorials