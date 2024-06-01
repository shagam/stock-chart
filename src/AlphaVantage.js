import React, {useState} from 'react';
// import './App.css';
import './alphaVantage.css'


const  AlphaVantage = (props) => { 
    var aleph = localStorage.getItem('alphaVantage');
    const [alpha, setAlpha] = useState(aleph);
    //console.log(`AlphaVantage localStorage ${alpha}`); 

    const handleAddFormChange = (event) => {
        event.preventDefault();
        // const fieldName = event.target.getAttribute("name");
        // const fieldValue = event.target.value;

        // console.log(event);
        console.log('alpha key change', event.target.name + " " + event.target.value.toUpperCase());
        setAlpha (event.target.value.toUpperCase());
    }

    const handleAddFormSubmit = (event) => {
        event.preventDefault();

        console.log("final data is: ", alpha);
        localStorage.setItem('alphaVantage', alpha);
        props.alphaCallBack (alpha);
    }

    function clearKey () {
      // console.log("clear");
      localStorage.removeItem ('alphaVantage');
      setAlpha(null)
      props.alphaCallBack(null)
    }

    //console.log('AlphaVantage render');

    return (
      <div className = 'alpha'>
        <div>&nbsp;</div>
        <h5> AlphaVatage.co </h5>
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="enter key from alphaVantage.co "
            onChange={handleAddFormChange}
            // value={alpha}
          />



         
          <button type="submit"> Enter new key</button> 
        </form>
          {/* <div>&nbsp;</div> */}
        &nbsp;&nbsp;key: ({alpha})
        &nbsp; <button type="button" onClick={()=>clearKey()}>Clear AlphaVantage key </button> 

      </div>
    )
}

export default AlphaVantage