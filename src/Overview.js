//

import React from 'react';


// https://quant.stackexchange.com/questions/26162/where-can-i-get-a-list-of-all-yahoo-finance-stocks-symbols

class Overview extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        }
    }

    componentDidMount() {
        this.fetchStock();
    }

    fetchStock() {
        const API_KEY = this.props["API_KEY"];
        const StockSymbol = this.props["StockSymbol"];
        const callBack = this.props["callBack"];
 


        //let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${StockSymbol}&outputsize=compact&apikey=${API_KEY}`;
        //let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${StockSymbol}&apikey=${API_KEY}`;
        let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${StockSymbol}&apikey=${API_KEY}`

    
        fetch(API_Call)
            .then(
                function(response) {
                    console.log(response.json);
                    return response.json();
                }
            )
            .then(
                function (data) {
                    //console.log(`${API_KEY}`);
                    //console.log(data);
                    const dataStr = JSON.stringify(data);
                    localStorage.setItem(`${StockSymbol}` + '_overview', `${dataStr}`);
                    callBack(data);
                }
            )
    }

    render() {
        if (this.props.StockSymbol == null)
            return null;
        return (
          <div>

          </div>
        );
    }
}

export default Overview;