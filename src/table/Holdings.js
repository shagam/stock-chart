import React, {useState} from 'react'
import axios from 'axios'
import cors from 'cors'

// corsUrl = "https://dinagold.org:5000/holdings?stock=qqq";

// https://stockanalysis.com/etf/ivv/holdings/

// (sym, rows, setError, corsServer, logFlags)
function Holdings (props) {
  const [err, setErr] = useState()

  const row_index = props.rows.findIndex((row)=> row.values.symbol === props.chartSymbol);
  if (row_index === -1) {
    alert ('stock missing: ' + props.chartSymbol)
    return;
  }

  if (props.rows[row_index].values.PE !== -2) {
    setErr ('Holdings only for ETF')
    return;
  }

  function getHoldings () {
    var corsUrl = "https://";
    corsUrl += props.corsServer + ":5000/holdings?stock=" + props.chartSymbol;

    axios.get (corsUrl)
    // getDate()
    .then ((result) => {
      if (result.status !== 200)
        return;

      // if (result.status.startsWith('err'))
      //   setErr(result.status)
      console.log (result.data, result.data.length)
      for (let i = 0; i < result.data.length; i++)
        console.log(i, result.data[i])
      // const arr = JSON.parse(result.data)

      // console.log(arr)
      setErr(JSON.stringify(result.data))

      // for (var i = 0; i < result.data.length; i++) {
      //   console.log (result.data[i])
      // }
      // const stockArray = JSON.parse(result.data);

      // console.log (stockArray)

      // if (rows[row_index].values.splits_list !== undefined) {
      //   // console.log ('old split: ', rows[row_index].values.splits)
      //   if (LOG && rows[row_index].values.splits_list)
      //   console.dir (rows[row_index].values.splits_list);
      // }

    } )
    .catch ((err) => {
      setErr(err.message + ' only for ETF')
      // console.log(err.message)
    })
  }

  return (
    <div style={{ border: '2px solid blue'}}> 

      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div> &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Holdings &nbsp;  </h6>
      </div>

      <br></br>
      
      {props.chartSymbol && <button type="button" onClick={()=>getHoldings ()}>GetHoldings  </button> }
      {err && <div style={{color:'red'}}> {err} </div>} 
      <div>&nbsp;</div>  
    </div>
)


}

export {Holdings} 