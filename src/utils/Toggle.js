import React, {useState, useEffect} from 'react'

export function Toggle(props) {


    // const toggleButton = {
    //     height: '70px',
    //     width: '100px',
    //     marginTop: '15%',
    //     boarder: 'none',
    //     fontSize: '15%',
    //     backGround: 'purple',
    //     color: 'white',
    //     cursor: 'pointer',
    //     boxShadow: 'rgba(0,0,0,35)',
    //     borderRadius: '10px',
    //     marginLeft: 'auto',
    //     marginRight: 'auto',
    //     display: 'table'


    // }
        // 'background-color': state ? props.colors[1]: props.colors[0], 
    // const [stateIntern, setStateIntern] = useState(false)

    return (
        <div>
            <button  title= {props.title} onClick={()=>{props.setState(! props.state)}} 
                style={{fontWeight: props.state? "bold" : 'normal',

                 }}>
                {/* */}
                {props.state ? props.names[1]: props.names[0]}
            </button> 
            {/* <div >{state ? 'close': 'open'}</div>     */}
        </div>
    )
}

export default Toggle;