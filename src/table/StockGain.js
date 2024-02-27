import React, {useState} from 'react'

const StockInfo = (props) => {

  const [gainFlag, setGainFlag] = useState(false);

  const gainFlagChange = () => {setGainFlag (! gainFlag)}

  return (
    <div style={{border:'2px solid blue'}}>
      <div> 
       
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div> &nbsp; &nbsp;
          <h6  style={{color: 'blue' }}> StockInfoRaw </h6>
        </div>

        <div>  &nbsp; <input  type="checkbox" checked={props.gainRawDividand} 
          onChange={() => props.setGainRawDividand(! props.gainRawDividand)} />
            &nbsp; filterVolume (Require pressing gain button) </div>
      </div>
      
      <div id="textarea_id"> 
      {props.stockGain &&
        <div>
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