
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

  const styleObj = {
    //fontSize: 14,
    color: "#4a54f1",
    float: "left",
    'margin-left': '0px',
    'padding-left': '0px',
    //textAlign: "center",
    //paddingTop: "100px",
  }


  return <div style={styleObj} className='upload-expense'>
    <label>
          <input
            type="checkbox" checked={ManualFlag}
            onChange={usageHelpChange}
          /> manual
    </label>
    <div className='txt'>
      {ManualFlag &&
        <div className='text'> 
          <textarea
            type='text'
            name='manual'
            cols='80'
            rows='30'
            readOnly
            defaultValue={manualText}
          >
          </textarea>
        </div>
      }
    </div>
  </div>;
};

export default Manual;