
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
        {/* <div>&nbsp;</div> */}
        <h5  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>StockOptions config: </h5>
        <form onSubmit = {formSubmit}>

          <label> ExpirationNum: &nbsp;
            <input style={{width: '50px'}} type="number" name="expirationNum" // required="required"
              placeholder="expirationNum"  onChange={(e) => setExpirationNum(e.target.value)} value={props.config.expirationNum} />
          </label>&nbsp; &nbsp; 

          <label> ExpirationCount &nbsp;
            <input style={{width: '50px'}} type="number" name="expirationCount" // required="required"
              placeholder="expirationCount"  onChange={(e) => setExpirationCount(e.target.value)} value={props.config.expirationCount} />
          </label>&nbsp; &nbsp; 



          <label> StrikeNum: &nbsp;
            <input style={{width: '50px'}} type="number" name="strikeNum" // required="required"
              placeholder="strikeNum"  onChange={(e) => setStrikeNum(e.target.value)} value={props.config.strikeNum} />
          </label>&nbsp; &nbsp; 

          <label> StrikeCount &nbsp;
            <input style={{width: '50px'}} type="number" name="strikeCount" // required="required"
              placeholder="strikeCount"  onChange={(e) => setStrikeCount(e.target.value)} value={props.config.strikeCount} />
          </label>&nbsp; &nbsp; 



          <br/>          <br/>
          <button  style={{background: 'aqua'}} type="submit"> submit update-config</button> 
        </form>
        
        <div>&nbsp;</div> 
          {/* <div>&nbsp;</div> */}
        {/* &nbsp;&nbsp;key: ({alpha}) */}
        {/* &nbsp; <button type="button" onClick={()=>clearKey()}>Clear  </button>  */}

      </div>
    )
}

export default  StockOptionsConfig    