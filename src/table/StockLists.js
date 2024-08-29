import React, {useState} from 'react'
import GlobalFilter from '../utils/GlobalFilter'
import {addStock} from './AddStock'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

function StockLists (props) {
    const [displayFlag, setDisplayFlag] = useState(false);

    const [listName, setListName] = useState();
    const [stockLists, setStockLists] = useState({});

    const [names, setNames] = useState([]);

    const LOG = props.logFlags && props.logFlags.includes("stockLists");


    const keys = Object.keys(stockLists);
    if (keys.length === 0)
        get()

    function buildListSelect(stockListLocal) {
        // if (stockLists === {})
        //     return;
        if (names.length !== 0)
            return
        const l = Object.keys(stockListLocal) 
        if (l.length === 0)
            return;
        // if (LOG )
            console.log ('build list=', l);         
        setNames(l)
    }


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
        buildListSelect(stockLists)
        localStorage.setItem('stocksLists', JSON.stringify(stockLists))
    }

    function get () {
        // if (LOG)
            console.log('get')
        const listsRaw = localStorage.getItem('stocksLists')
        if (listsRaw) {
            const stockListLocal = JSON.parse(listsRaw)
            setStockLists(stockListLocal)
            buildListSelect(stockListLocal)
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
        buildListSelect(stockLists)
    }

    function insert() {
        if (! listName) {
            alert ('Missing list Name')
            return;
        }

        const list = stockLists[listName];
        for (let i = 0; i < list.length; i++)
            addStock(props.rows, list[i], false)
        // buildListSelect()
        props.saveTable('stockLists');  
        window.location.reload();
        buildListSelect(stockLists)
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
                    &nbsp; &nbsp; <button onClick={add} > addNewList </button>  
                    {/* &nbsp; &nbsp; <button onClick={get} > get </button>   */}

                </div>
                <div style={{display:'flex'}}>
                    <div style={{display:'flex'}}> <ComboBoxSelect serv={names} nameList={names} setSelect={setListName} title='Choose-list' options={names} defaultValue={names[0]}/> </div>
                    &nbsp; &nbsp; <button onClick={del} > delete </button>  
                    &nbsp; &nbsp; <button onClick={insert} > insertInTable </button>  
                </div>

                <pre> {JSON.stringify(names, null, 2)}</pre>
                <pre> {JSON.stringify(stockLists, null, 2)}</pre>
                
          </div>}
      </div>

    )
}

export default StockLists