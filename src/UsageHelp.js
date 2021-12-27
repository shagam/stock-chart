
import React, {useState, useMemo} from 'react'
import HELP_FILE from './StockChart.usage'


export const UsageHelp = () => {
  const [usageHelp, setUsageHelp] = useState(false);

  const helpText = useMemo(() => HELP_FILE, []);

  let fileReader;
  const usageHelpChange = () => {setUsageHelp (! usageHelp)}

  const handleFileRead = (e) => {
    const content = fileReader.result;
    console.log(content)
    // … do something with the 'content' …
  };
  
  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };
  
  return <div className='upload-expense'>
    <input
      type='file'
      id='file'
      className='input-file'
      accept='.csv'
      onChange={e => handleFileChosen(e.target.files[0])}
    />
    <label>
          <input
            type="checkbox" checked={usageHelp}
            onChange={usageHelpChange}
          /> usageHelp
    </label>
    <div>
      {usageHelp && {helpText}}
    </div>

  </div>;
};

export default UsageHelp;