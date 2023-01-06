import React from 'react'
// import ComboBox from 'react-responsive-combo-box'
// import 'react-responsive-combo-box/dist/index.css'
import Dropdown from 'react-bootstrap/Dropdown';

export function ErrorList (props) {

    return (
        <div  className=' text-left mt-10'> 
           {/* <hr/>  */}
             { props.errorList.map((d) => (
             <div key={d}>
                 {d}
             </div>
           ))
           }
        </div>
    )

}

export default ErrorList