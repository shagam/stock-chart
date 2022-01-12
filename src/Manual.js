
import React, {useState, useEffect, useMemo, Component} from 'react'
import txt from './Manual.text'
import './Manual.css'

import filePDF from './Manual.pdf'
// import {Document,Page} from 'react-pdf'

// import Viewer, { Worker } from '@phuocng/react-pdf-viewer';
// import '@phuocng/react-pdf-viewer/cjs/react-pdf-viewer.css';

const Manual = () => {
  const [ManualFlag, setManualFlag] = useState(false);
  const [manualText, setManualText] = useState("One\nTwo\nThree");
  // const [manualPdf, setManualPdf] = useState("")
  // const [numPages, setNumPages] = useState(null)
  // const [pageNumber, setPageNumber] = useState(1)

  //const pdfText_ = useMemo(() => pdf, []);

  const usageHelpChange = () => {setManualFlag (! ManualFlag)}

  // const  onDocumentLoadSuccess = ({numPages}) => {
  //   console.log ('loaded');
  //   setNumPages(numPages);
  // }

  // read helpFile into helpText
  useEffect (() => { 
    fetch (txt)
    .then (r => r.text())
    .then (text => {
      setManualText(text);
      //console.log (text)
    })

  }, [])

  // onLoadError {console.error}
try {
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
          {/* <textarea type='text' name='manual' cols='80' rows='30' readOnly
           defaultValue={manualText}  >
          </textarea> */}

          
          <div>       
          <object data="http://africau.edu/images/default/sample.pdf" type="application/pdf" width="200%" height="200%">   </object>

          <object data={filePDF} type="application/pdf"
           width="100%" height="100%">  </object>
     
       
            {/* <Document
             file="./Manual.pdf"
              // file='https://publications.mfo.de/bitstream/handle/mfo/3593/OWR_2017_28.pdf?sequence=1&isAllowed=y'
               onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
            </Document>
            <p> Page = {pageNumber} of {numPages} </p> */}
          </div>
        </div>
      }
    </div>
  </div>;
} catch (e) {console.log (e)}
};

export default Manual;