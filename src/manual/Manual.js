
import React, {useState, useEffect, useMemo} from 'react'
import { Link, useNavigate } from 'react-router-dom'

import txt from './Manual.txt'
import './Manual.css'

import filePDF from './Manual.pdf'

const Manual = (props) => {
  const [ManualFlag, setManualFlag] = useState(false);
  // const [manualText, setManualText] = useState("One\nTwo\nThree");
  //const [manualTextPdf, setManualTextPdf] = useState("")

  const pdfCache = useMemo(() => filePDF, []);

  const usageHelpChange = () => {setManualFlag (! ManualFlag)}

 
  // read helpFile into helpText
  // useEffect (() => { 
  //   fetch (txt)
  //   .then (r => r.text())
  //   .then (text => {
  //     setManualText(text);
  //     //console.log (text)
  //   })
  // }, [])

  // onLoadError {console.error}
try {
  return <div className='upload-expense'>
    <div className='txt'>
      <hr style={{ border: '3px solid #000000'}}/> 
      <h4 style={{color:'Green'}}>Manual</h4>

      <div>
          <Link to="/" > Home </Link>
      </div>
      <hr style={{ border: '3px solid #000000'}}/> 
     
      <div className='text'> 
        <div id = "pdf_id">       
            <object data={pdfCache} type="application/pdf"
            width="1000" height="700" border='3' standby="Loading" >  </object>    
          </div>
      </div>
      
    </div>
  </div>;
} catch (e) {console.log (e)}
};

export default Manual;