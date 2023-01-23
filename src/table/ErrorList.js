import React, {useState} from 'react'
// import ComboBox from 'react-responsive-combo-box'
// import 'react-responsive-combo-box/dist/index.css'
import Dropdown from 'react-bootstrap/Dropdown';
import { Container } from 'react-bootstrap'

export function ErrorList (props) {
    const [visible, setVisible] = useState(false)

    // style={{display: 'flex'}}
    return (  
  
        <div  >   
            <div style={{color: 'red'}}>
                <input 
                    type="checkbox" checked={visible}
                    onChange={() => {setVisible (!visible)}}
                /> errors
            </div>

            <Container  className='d-flex align-items-left justify-content-left' style={{maxHeight: "15vh", padding: '0px', margin:'0px'}}  > 
            {/* <hr/>  */}
            <div className="container" style ={{overflow: 'scroll', hight: '17%'}} >
                { visible && props.errorList.map((err) => (
                    // display each err in array in one line
                <div style ={{display: 'flex'}} >
                    {err.map((dd) => <div>&nbsp; {dd}</div>)} 
                </div>
                ))
                }
            </div>
           </Container>
        </div>

    )

}

export default ErrorList