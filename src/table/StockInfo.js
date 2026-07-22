import React, {useState, useEffect} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}

  function numberWithCommas(x) {
    const isIntegerString = (str) => /^-?\d+$/.test(str);
    if (! isIntegerString(x)) {
      return x; // Return the original value if it's not an integer string
    }
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
  }

  return (
    <div style = {{ border: '2px solid blue'}} >
      <div id="textarea_id"> 
      {/* {! props.stockInfo && <h6 style={{color: 'red'}}> No info (probably an ETF)  </h6>} */}
      <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Stock technical raw info. (etf not Supported)  &nbsp; </h6>

      {props.chartSymbol !== props.infoSymbol && <h6 style={{color: 'red'}}> No info or symbol misMatch (An ETF or data for a previous symbol)  </h6>}

      {/* Table of symbol/stock attributes: value */}

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
                        <td  style={{padding: '2px', margin: '2px'}}>{i}</td>
                        <td style={{padding: '2px', margin: '2px', color: 'ForestGreen', minWidth: '14rem', border: `none` }} > {infoName}: &nbsp;&nbsp; </td>
                        <td style={{padding: '2px', margin: '2px', border: `none`}} > 
                            <div>{numberWithCommas(props.stockInfo[infoName])} </div>
                          </td> 
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