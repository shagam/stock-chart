
import React, {useState, useEffect} from 'react'
import txt from './Manual.text'
import './Manual.css'

// import pdf from './Manual.pdf'
// import {Document,Page} from 'react-pdf'

const Manual = () => {
  const [ManualFlag, setManualFlag] = useState(false);
  const [manualText, setManualText] = useState("One\nTwo\nThree");
  // const [manualPdf, setManualPdf] = useState("")
  // const [numPages, setNumPages] = useState(null)
  
  const usageHelpChange = () => {setManualFlag (! ManualFlag)}

  // read helpFile into helpText
  useEffect (() => { 
    fetch (txt)
    .then (r => r.text())
    .then (text => {
      setManualText(text);
      //console.log (text)
    })

    // fetch (pdf)
    // .then (r => r.text())
    // .then (pdf => {
    //   setManualText(pdf);
    //   //console.log (text)
    // })

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
          <textarea
            type='text'
            name='manual'
            cols='80'
            rows='30'
            readOnly
            defaultValue={manualText}
          >
          </textarea>
          {/* <div>
            <Document file='file:///C:/Manual.pdf'  onLoadSuccess={({ numPages }) =>setNumPages(numPages)} style={{width:'100%'}}>
              {Array.apply(null, Array(numPages))
              .map(page =>
                <Page pageNumber={page} size='A4' />
              )}
            </Document>
          </div> */}
        </div>
      }
    </div>
  </div>;
};

export default Manual;