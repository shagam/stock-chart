import React from 'react';
import Plot from 'react-plotly.js';

// https://quant.stackexchange.com/questions/26162/where-can-i-get-a-list-of-all-yahoo-finance-stocks-symbols

class StockChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stockChartXValues: [],
            stockChartYValues: []
        }
    }

    componentDidMount() {
        this.fetchStock();
    }

    fetchStock() {
        const pointerToThis = this;
        //console.log (pointerToThis);
        const API_KEY = this.props["API_KEY"];
        //const StockSymbol = this.props["StockSymbol"];
        const StockSymbol = localStorage.getItem ('StockChart');
        const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
        let periodCapital = period[1][0];  
        //let periodLower = `Time Series (${period[1][1]})`; 
        //console.log (`${this.props}`);


        let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${StockSymbol}&outputsize=compact&apikey=${API_KEY}`;
        //let API_Call = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${StockSymbol}&apikey=${API_KEY}`;

        let stockChartXValuesFunction = [];
        let stockChartYValuesFunction = [];
        
        let histValues ='';
        const histStr = localStorage.getItem (`${StockSymbol}` + '_chart');
        if (histStr) {
            //console.log (histStr);
            histValues = JSON.parse(histStr);
  
            //let periodTag = 'Time Series (Daily)';
            let periodTag = 'Weekly Adjusted Time Series';
            //let periodTag = 'Monthly Adjusted Time Series';
            for (var key in histValues[`${periodTag}`]) {
                stockChartXValuesFunction.push(key);
                stockChartYValuesFunction.push(histValues[`${periodTag}`][key]['1. open']);
            }
                //console.log (stockChartXValuesFunction)
                //console.log (stockChartYValuesFunction)
                pointerToThis.setState({
                    stockChartXValues: stockChartXValuesFunction,
                    stockChartYValues: stockChartYValuesFunction
                });
        }
        fetch(API_Call)
            .then(
                function(response) {
                    //console.log(response);
                    return response.json();
                }
            )
            .then(
                (data) => {
                    const dataStr = JSON.stringify(data);
                    localStorage.setItem (`${StockSymbol}` + '_chart', dataStr);

                    //let periodTag = 'Time Series (Daily)';
                    let periodTag = 'Weekly Adjusted Time Series';
                    //let periodTag = 'Monthly Adjusted Time Series';
                    for (var key in data[`${periodTag}`]) {
                        stockChartXValuesFunction.push(key);
                        stockChartYValuesFunction.push(data[`${periodTag}`][key]['1. open']);
                    }
                    //console.log (stockChartXValuesFunction)
                    //console.log (stockChartYValuesFunction)
                    pointerToThis.setState({
                        stockChartXValues: stockChartXValuesFunction,
                        stockChartYValues: stockChartYValuesFunction
                    });
                }
            )
    }

    render() {
        if (this.props.StockSymbol == null)
           return null;
        return (
          <div>

            <Plot
              data={[
                {
                  x: this.state.stockChartXValues,
                  y: this.state.stockChartYValues,
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'red' },
                 },

              ]}
              layout={{ width: 720, height: 400, title: this.props.StockSymbol }}
            />

          </div>
        );
    }
}

export default StockChart;
