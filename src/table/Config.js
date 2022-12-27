import React, {useState} from 'react';
import GetInt from '../utils/GetInt'
import AlphaVantage from '../AlphaVantage'

const  Config = (props) => { 

  const [configFlag, setConfigFlag] = useState (false);
  //console.log(`AlphaVantage localStorage ${alpha}`); 


  const configFlagChange = () => {setConfigFlag (! configFlag)}

  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid blue'
  };
  //   
  return (
    <div style = {style}>
      <input
        type="checkbox" checked={configFlag}
        onChange={ configFlagChange }
      /> config 

      { configFlag &&
        <div id = "config_id">
          <AlphaVantage alphaCallBack={props.alphaCallBack} />

        </div>
      }

    </div>
  )
}

export default Config