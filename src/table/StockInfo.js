import React, {useState, useEffect} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}



  return (
    <div>
      <div>
        <input
          type="checkbox" checked={infoFlag}
          onChange={infoFlagChange}
        /> StockInfoRaw
      </div>
      
      <div id="textarea_id"> 
      {infoFlag && props.stockInfo &&
        <div>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div>
        
          <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 

          {props.stockInfo && Object.keys(props.stockInfo).map((infoName,i)=>{
            return (
                <div style={{display: 'flex'}} key={i}>
                  <div style={{'color': 'ForestGreen', minWidth: '20vw'}} > {infoName}: &nbsp;&nbsp; </div>
                  <div > {props.stockInfo[infoName]} </div> 
                </div>
              )
          })}
          <br></br>
          </div>

        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo