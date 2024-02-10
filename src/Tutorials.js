import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'

function Tutorials () {

    const [aboutFlag, setAboutFlag] = useState(false);

    return (
    <div>

        <div>
            <div className='w-100 text-left mt-2'>
                <Link to="/" > Home </Link>
            </div>
            <hr/> 
            <h4>Tutorials</h4>

            <hr/> 
            <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp; 
            <a href="https://youtu.be/Rv5a0tkMISE" >Hebrew tutorial</a> &nbsp; &nbsp; 
            {/* <a href="https://stocks-compare.netlify.app" >Link to Stocks analyse and compare</a>  */}
            <hr/> 

        </div>


    </div>
    )}

    export default Tutorials