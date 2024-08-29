import React, {useState} from 'react'
import GlobalFilter from '../utils/GlobalFilter'
import {addStock} from './AddStock'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

function StockLists (props) {
    const [displayFlag, setDisplayFlag] = useState(false);
    const [version, setVersion] = useState(0)
    const [listName, setListName] = useState();
    const [newListName, setNewListName] = useState();
    const [stockLists, setStockLists] = useState({});

    const [nameArray, setNameArray] = useState([]);

    const LOG = props.logFlags && props.logFlags.includes("stockLists");

    function refresh() {
        // window.location.reload();
        // setVersion(version+1)
    }

    const keys = Object.keys(stockLists);
    if (keys.length === 0)
        get()

    function buildListSelect(stockListLocal) {
        // if (stockLists === {})
        //     return;
        if (nameArray.length !== 0)
            return

        const nameArrayLocal = Object.keys(stockListLocal) 
        // if (LOG )
        console.log ('before build array=', nameArray); 
       
        if (nameArrayLocal.length === 0)
            return;
       
        setNameArray(nameArrayLocal.sort())
        console.log ('after build array=', nameArrayLocal); 
        setListName(nameArrayLocal[0])
    }


    function add() {
        const symbols = [];
        for (let i = 0; i < props.rows.length; i++) {
            const sym = props.rows[i].values.symbol
            symbols.push (sym)
        }
       
        console.log ('addNewList', newListName, symbols)

        if (! newListName) {
            alert ('Missing list Name')
            return;
        }

        //** get old lists before add */
        const keys = Object.keys(stockLists);
        if (keys.length === 0)
            get()

        stockLists[newListName] = symbols;
        const nameArrayLocal = Object.keys(stockLists)
        setNameArray(nameArrayLocal)
        setStockLists({})
        setStockLists(stockLists)
        // buildListSelect(stockLists)
        localStorage.setItem('stocksLists', JSON.stringify(stockLists))
    }

    function get () {
        const listsRaw = localStorage.getItem('stocksLists')
        if (! listsRaw || listsRaw === '{}')
            return;
        // const keys = Object.keys(listsRaw);
        // if (keys.length > 0) {
            const stockListLocal = JSON.parse(listsRaw)
            setStockLists(stockListLocal)

            const nameArrayLocal = Object.keys(stockListLocal)
            setNameArray(nameArrayLocal)
            // buildListSelect(stockListLocal)
        // }
    }

    function del () {
        if (! listName) {
            alert ('Missing list Name')
            return;
        }
        console.log('del', listName)
        if (stockLists[listName]) {
            delete stockLists[listName]
            localStorage.setItem('stocksLists', JSON.stringify(stockLists))
            setStockLists(stockLists)
            const nameArrayLocal = Object.keys(stockLists)
            setNameArray(nameArrayLocal)
            setNewListName()
        }
        else
            console.log ('missing list=', listName)
    }

    function insert() {
        if (! listName) {
            alert ('Missing list Name')
            return;
        }
        
        console.log('insetInTable', listName)

        const list = stockLists[listName];
        if (! list) {
            console.log ('err', listName)
            return;
        }
        for (let i = 0; i < list.length; i++)
            addStock(props.rows, list[i], false)

        props.saveTable('stockLists');  
        const nameArrayLocal = Object.keys(stockLists)
        setNameArray(nameArrayLocal)
        window.location.reload();
    }

    return (


        <div style={{border:'2px solid blue'}}>

            <div>
                <input type="checkbox" checked={displayFlag} onChange={() => {setDisplayFlag (! displayFlag)}}  /> stocks-lists
            </div>

            { displayFlag && <div>
                {version}
                <div style={{display: 'flex'}}>
                    {/* <div style={{padding: '14px'}}>List-name</div> */}
                    <button style={{hight: '8px' }} onClick={add} > addNewList </button>   &nbsp; &nbsp;
                    <GlobalFilter className="stock_button_class_" filter={newListName} setFilter={setNewListName} name='newListName' isMobile={false}/>

                    {/* &nbsp; &nbsp; <button onClick={get} > get </button>   */}
                </div>
                <div> &nbsp; </div>
                <div style={{display:'flex'}}>
                    <div style={{display:'flex'}}> <ComboBoxSelect serv={nameArray} nameList={nameArray} setSelect={setListName}
                     title='Choose-list' options={nameArray} defaultValue={listName}/> </div>
                    &nbsp; &nbsp; <button onClick={del} > delete </button>  
                    &nbsp; &nbsp; <button onClick={insert} > insertInTable </button>  
                </div>

                <pre> names {JSON.stringify(nameArray, null, 2)}</pre>
                { nameArray.map((m,k)=> {
                    return(<div key={k}> <hr/> {m} &nbsp;&nbsp; {stockLists[m].length} &nbsp; &nbsp; {JSON.stringify(stockLists[m])}</div>)
                })}
                {/* <pre> stockLists {JSON.stringify(stockLists, null, 2)}</pre> */}
                
          </div>}
      </div>

    )
}

export default StockLists