
import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import './App.css';
import '../alphaVantage.css'


function StockOptionsConfig (props) { 
  console.log(props.config)
  const [expirationCount, setExpirationCount] = useState(3);
  const [expirationNum, setExpirationNum] = useState(-1);
  const [strikeCount, setStrikeCount] = useState(3);
  const [strikeNum, setStrikeNum] = useState(-1);
  const  options = ['call', 'put'];
  const [callOrPut, setCallOrPut] = useState(options[0]); // default to call options
  
  const [compoundYield, setCompoundYield] = useState(false); // true - compound gain, false - simple gain
  const [percent, setPercent] = useState(true); // true - percent, false - gain factor

  const [alpha, setAlpha] = useState();
  
  var flexConfig = localStorage.getItem('stockOptionsConfig');


    const formChange = (event) => {
        event.preventDefault();
        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        // console.log(event);
        console.log('alpha key change', event.target.name + " " + event.target.value.toUpperCase());
        setAlpha (event.target.value.toUpperCase());
    }

    const formSubmit = (event) => {
        event.preventDefault();

        console.log("final data is: ", alpha);
        localStorage.setItem('stockOptionsConfig', alpha);
        // props.alphaCallBack (alpha);
    }

    function clearKey () {
      // console.log("clear");
      localStorage.removeItem ('stockOptionsConfig');
      setAlpha(null)
      // props.alphaCallBack(null)
    }

    //console.log('AlphaVantage render');

    return (
      <div style={{border:'2px solid magenta'}} className = 'alpha'>
        {/* <div style={{border:'2px solid blue'}}></div> */}
        <div>&nbsp;</div>
        <h6>StockOptions config: </h6>
        <form onSubmit = {formSubmit}>
          <label> ExpirationCount &nbsp;
            <input style={{width: '50px'}} type="number" name="expirationCount" // required="required"
              placeholder="expirationCount"  onChange={(e) => setExpirationCount(e.target.value)} value={props.config.expirationCount} />
          </label>&nbsp; &nbsp; 

          <label> ExpirationNum: &nbsp;
            <input style={{width: '50px'}} type="number" name="expirationNum" // required="required"
              placeholder="expirationNum"  onChange={(e) => setExpirationNum(e.target.value)} value={props.config.expirationNum} />
          </label>&nbsp; &nbsp; 

          <br/>          <br/>
          <button type="submit"> submit update-config</button> 
        </form>
        
        <hr/> 
          {/* <div>&nbsp;</div> */}
        {/* &nbsp;&nbsp;key: ({alpha}) */}
        {/* &nbsp; <button type="button" onClick={()=>clearKey()}>Clear  </button>  */}

      </div>
    )
}

export default  StockOptionsConfig    