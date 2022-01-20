import React, {useState} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}


  if (props.stockInfo === '')
    return null;
  // const infoStr = JSON.parse  (props.stockInfo);
  const infoStr= props.stockInfo.split(",").join(',\n');
  //const infoStr = JSON.stringify (props.stockInfo);
  //const infoList = infoStr.split(',');


  return (
    <div>
      <div>
        <input
          type="checkbox" checked={infoFlag}
          onChange={infoFlagChange}
        /> StockInfo
      </div>
      
      <div id="textarea_id"> 
      {infoFlag &&
        <textarea type='text' name='stockInfo' cols='80' rows='30' readOnly
        defaultValue={infoStr}  >
        </textarea>
      }
      </div>
    </div>
  )
}

export default StockInfo