import React, {useState, useEffect} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}



  return (
    <div style = {{ border: '2px solid blue'}} >
      <div id="textarea_id"> 
      { props.stockInfo &&
        <div>
          <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div> &nbsp; &nbsp; 
            <h6 style={{color: 'blue'}}> InfoRaw  </h6>
          </div>

          <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 

          <table>
            <tbody> 
              {props.stockInfo && 
                Object.keys(props.stockInfo).map((infoName,i)=>{
                  return (
                      <tr  key={i}>
                        <td style={{'color': 'ForestGreen', minWidth: '14rem', border: `none` }} > {infoName}: &nbsp;&nbsp; </td>
                        <td style={{ border: `none`}} > {props.stockInfo[infoName]} </td> 
                      </tr>
                  )
                })
              }
            </tbody>  
          </table>

          <br></br>
          </div>

        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo