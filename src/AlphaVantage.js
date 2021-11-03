import React, {useState} from 'react';
// import './App.css';
import './alphaVantage.css'


const  AlphaVantage = (alphaCallBack) => { 
    var aleph = localStorage.getItem('alphVAntage');
    const [alpha, setAlpha] = useState(aleph);
    console.log(`AlphaVantage localStorage ${alpha}`); 

    const handleAddFormChange = (event) => {
        event.preventDefault();
        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        // console.log(event);
        console.log(event.target.name + " " + event.target.value);
        setAlpha (event.target.value);
    }

    const handleAddFormSubmit = (event) => {
        event.preventDefault();
        setAlpha(event.target.value);
        console.log("final data is: ", alpha);
        localStorage.setItem('alphVAntage', `${alpha}`);
        alphaCallBack (alpha);

    }

    //console.log('AlphaVantage render');

    return (
      <div class = 'alpha'>
        <label for='test'> Enter id (get from www.alphavantage.co): {alpha} </label>
        <form onSubmit = {handleAddFormSubmit}>
          <input
            type="text"
            name="symbol"
            required="required"
            placeholder="enter stock symbol to add ..."
            onChange={handleAddFormChange}
          />
          <button type="submit"> Add</button>
        </form>

      </div>
    )
}

export default AlphaVantage