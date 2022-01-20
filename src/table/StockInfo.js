import React, {useState} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}

  const infoStr= props.stockInfo.split(",").join(',\n');

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
        <textarea type='text' name='stockInfo' cols='80' rows='20' readOnly
        defaultValue={infoStr}  >
        </textarea>
      }
      </div>
    </div>
  )
}

export default StockInfo