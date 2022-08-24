import React, {useState} from 'react';
import GetInt from '../utils/GetInt'
import AlphaVantage from '../AlphaVantage'

const  Config = (props) => { 
  var config_ = Number(localStorage.getItem('flex'));
  const [flex, setFlex] = useState(config_);
  const [configFlag, setConfigFlag] = useState (false);
  //console.log(`AlphaVantage localStorage ${alpha}`); 


  function flexSubmit_ (flex) {
    localStorage.setItem('flex', flex);
    props.flexCallBack (flex);
  }

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
          <GetInt init={flex} callBack={flexSubmit_} title='flex' pattern="[0-9]+"/>



        </div>
      }

    </div>
  )
}

export default Config