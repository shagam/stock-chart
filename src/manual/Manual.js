
import React, {useState, useEffect} from 'react'
import txt from './Manual.txt'
import './Manual.css'

import filePDF from './Manual.pdf'

const Manual = (props) => {
  const [ManualFlag, setManualFlag] = useState(false);
  // const [manualText, setManualText] = useState("One\nTwo\nThree");
  //const [manualTextPdf, setManualTextPdf] = useState("")
 
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
    <div>
          <input
            type="checkbox" checked={ManualFlag}
            onChange={usageHelpChange}
          /> manual
    </div>
    <div className='txt'>
      {ManualFlag &&
        <div className='text'> 
          <div id = "pdf_id">       
              <object data={filePDF} type="application/pdf"
              width="1000" height="700" border='3' standby="Loading" >  </object>    
           </div>
        </div>
      }
    </div>
  </div>;
} catch (e) {console.log (e)}
};

export default Manual;