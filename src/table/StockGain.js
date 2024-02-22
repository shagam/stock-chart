import React, {useState} from 'react'

const StockInfo = (props) => {

  const [gainFlag, setGainFlag] = useState(false);

  const gainFlagChange = () => {setGainFlag (! gainFlag)}

  return (
    <div>
      <div style={{display:'flex'}}>
        <input
          type="checkbox" checked={gainFlag}
          onChange={gainFlagChange}
        /> &nbsp;StockGainRaw

        {gainFlag && <div>  &nbsp; &nbsp; <input  type="checkbox" checked={props.gainRawDividand} 
          onChange={() => props.setGainRawDividand(! props.gainRawDividand)} />
            &nbsp; filterVolume (Require pressing gain button) </div> }
      </div>
      
      <div id="textarea_id"> 
      {gainFlag && props.stockGain &&
        <div>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div>
          <textarea type='text' name='stockInfo' cols={props.gainRawDividand ? 125 : 180} rows='15' readOnly
            value={props.stockGain}  >
          </textarea>
        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo