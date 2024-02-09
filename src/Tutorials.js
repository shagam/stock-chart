import React, {useState} from 'react';

function Tutorials () {

    const [aboutFlag, setAboutFlag] = useState(false);

    return (
    <div>
        <input type="checkbox" checked={aboutFlag} onChange={() => {setAboutFlag (! aboutFlag)}} /> Tutorials
        {aboutFlag &&
        <div>
        
            <hr/> 
            <a href="https://youtu.be/y3CBXkZzSNs" >English tutorial</a>  &nbsp; &nbsp; 
            <a href="https://youtu.be/Rv5a0tkMISE" >Hebrew tutorial</a> &nbsp; &nbsp; 
            {/* <a href="https://stocks-compare.netlify.app" >Link to Stocks analyse and compare</a>  */}
            <hr/> 
        </div>
        }
    </div>
    )}

    export default Tutorials