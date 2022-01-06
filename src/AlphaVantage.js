import React, {useState} from 'react';
// import './App.css';
import './alphaVantage.css'


const  AlphaVantage = (alphaCallBack) => { 
    var aleph = localStorage.getItem('alphaVantage');
    const [alpha, setAlpha] = useState(aleph);
    //console.log(`AlphaVantage localStorage ${alpha}`); 

    const handleAddFormChange = (event) => {
        event.preventDefault();
        // const fieldName = event.target.getAttribute("name");
        // const fieldValue = event.target.value;

        // console.log(event);
        console.log(event.target.name + " " + event.target.value.toUpperCase());
        setAlpha (event.target.value.toUpperCase());
    }

    const handleAddFormSubmit = (event) => {
        event.preventDefault();

        console.log("final data is: ", alpha);
        localStorage.setItem('alphaVantage', `${alpha}`);
        alphaCallBack (alpha);
    }

    //console.log('AlphaVantage render');

    return (
      <div className = 'alpha'>
        <div> get key from www.alphavantage.co): ({alpha}) </div>
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="enter alphaVantage.co key "
            onChange={handleAddFormChange}
            // value={alpha}
          />
          <button type="submit"> Enter</button>
        </form>

      </div>
    )
}

export default AlphaVantage