import React, {useState} from 'react'
// import ComboBox from 'react-responsive-combo-box'
// import 'react-responsive-combo-box/dist/index.css'
import Dropdown from 'react-bootstrap/Dropdown';

export function ErrorList (props) {
    const [visible, setVisible] = useState(false)
    return (     
        <div  className=' text-left mt-10'> 
            <div style={{'color': 'red'}}>
                <input 
                    type="checkbox" checked={visible}
                    onChange={() => {setVisible (!visible)}}
                /> errors
            </div>

           {/* <hr/>  */}
             { visible && props.errorList.map((d) => (
             <div key={d[1]}>
                 {d[0]}  &nbsp; {d[1]}
             </div>
           ))
           }
        </div>
    )

}

export default ErrorList