
import React, {useState, useEffect} from 'react'
import txt from './StockChart.usage'


const UsageHelp = () => {
  const [usageHelp, setUsageHelp] = useState(false);
  const [helpText, setHelpText] = useState("One\nTwo\nThree");

  
  const usageHelpChange = () => {setUsageHelp (! usageHelp)}

  // read helpFile into helpText
  useEffect (() => { 
    fetch (txt)
    .then (r => r.text())
    .then (text => {
      setHelpText(text);
      //console.log (text)
    })
  }, [])

  return <div className='upload-expense'>
    <label>
          <input
            type="checkbox" checked={usageHelp}
            onChange={usageHelpChange}
          /> usageHelp
    </label>
    <div className='txt'>
      {usageHelp &&
        <div className='text'> 
          <textarea>
            {helpText}  
          </textarea>
        </div>
      }
    </div>
  </div>;
};

export default UsageHelp;