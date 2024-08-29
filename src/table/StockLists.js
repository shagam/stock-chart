import React, {useState} from 'react'
import GlobalFilter from '../utils/GlobalFilter'


function StockLists (props) {
    const [listName, setListName] = useState();
    const [stockLists, setStockLists] = useState({});
    const [displayFlag, setDisplayFlag] = useState(false);

    const keys = Object.keys(stockLists);
    if (keys.length === 0)
        get()

    const LOG = props.logFlags && props.logFlags.includes("stockLists");

    function add() {
        const symbols = [];
        for (let i = 0; i < props.rows.length; i++) {
            const sym = props.rows[i].values.symbol
            symbols.push (sym)
        }
       
        console.log (listName, symbols)

        if (! listName) {
            alert ('Missing list Name')
            return;
        }

        //** get old lists before add */
        const keys = Object.keys(stockLists);
        if (keys.length === 0)
            get()

        stockLists[listName] = symbols; 
        setStockLists(stockLists)
        localStorage.setItem('stocksLists', JSON.stringify(stockLists))
    }

    function get () {
        const listsRaw = localStorage.getItem('stocksLists')
        if (listsRaw) {
            const lists = JSON.parse(listsRaw)
            setStockLists(lists)
        }
    }

    function del () {
        if (! listName) {
            alert ('Missing list Name')
            return;
        }
        if (stockLists[listName]) {
            delete stockLists[listName]
            localStorage.setItem('stocksLists', JSON.stringify(stockLists))
            setStockLists(stockLists)
        }
        else
            console.log ('missing list=', listName)
    }

    function insert() {

    }

    return (


        <div style={{border:'2px solid blue'}}>

            <div>
                <input type="checkbox" checked={displayFlag} onChange={() => {setDisplayFlag (! displayFlag)}}  /> stocks-lists
            </div>

            { displayFlag && <div>
                <div style = {{display: 'flex'}}>
                    <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div> &nbsp; &nbsp;
                    {/* <h6  style={{color: 'blue' }}> Stock-lists </h6> */}
                </div>

                <div style={{display: 'flex'}}>
                    <div style={{padding: '14px'}}>List-name</div>
                    <GlobalFilter className="stock_button_class_" filter={listName} setFilter={setListName} name='listName' isMobile={false}/>
                    &nbsp; &nbsp; <button onClick={add} > addLIst </button>  
                    {/* &nbsp; &nbsp; <button onClick={get} > get </button>   */}
                    &nbsp; &nbsp; <button onClick={del} > delete </button>  
                    &nbsp; &nbsp; <button onClick={inser} > insertInTable </button>  
                </div>
                <pre>{JSON.stringify(stockLists, null, 2)}</pre>
          </div>}
      </div>

    )
}

export default StockLists