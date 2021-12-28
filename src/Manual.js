
import React, {useState, useEffect} from 'react'
import txt from './Manual.text'
import './Manual.css'


const Manual = () => {
  const [ManualFlag, setManualFlag] = useState(false);
  const [manualText, setManualText] = useState("One\nTwo\nThree");

  
  const usageHelpChange = () => {setManualFlag (! ManualFlag)}

  // read helpFile into helpText
  useEffect (() => { 
    fetch (txt)
    .then (r => r.text())
    .then (text => {
      setManualText(text);
      //console.log (text)
    })
  }, [])

  return <div className='upload-expense'>
    <label>
          <input
            type="checkbox" checked={ManualFlag}
            onChange={usageHelpChange}
          /> manual
    </label>
    <div className='txt'>
      {ManualFlag &&
        <div className='text'> 
          <textarea>
            {manualText}  
          </textarea>
        </div>
      }
    </div>
  </div>;
};

export default Manual;