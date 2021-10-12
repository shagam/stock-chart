import React from 'react';

class GetAllStocks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            //stockChartXValues: [],
            //stockChartYValues: []
        }
    }

    componentDidMount() {
        this.fetchStock();
    }

    fetchStock() {
        //const pointerToThis = this;
        //console.log (pointerToThis);
        const API_KEY = this.props["API_KEY"];



       
        //let API_Call = `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey=${API_KEY}`;
        //let API_Call = "https://github.com/shilewenuw/get_all_tickers/blob/master/get_all_tickers/tickers.csv/github shilewenuw/get_all_tickers";


        const StockSymbol = this.props["StockSymbol"];
        const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
        let periodCapital = period[1][0];  

        console.log (`${this.props}`);
        let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${StockSymbol}&outputsize=compact&apikey=${API_KEY}`;

        console.log(`${API_Call}`);
        console.log (this.props);

        fetch(API_Call)
            .then(
                function(response) {
                    //console.log(response);
                    //console.log(response.json);
                    //const firstLineLength = response.insexOf("\n");
                    //console.log (firstLineLength);
                    return response;
                }
            )
            .then(
                function (data) {
                    console.log(data);
                }
            )
    }

    render() {
        
        return (
          <div>
            <h1>Stock List </h1>
          </div>
        );
    }
}

export default GetAllStocks;