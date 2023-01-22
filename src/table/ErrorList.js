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

            <Container  className='d-flex align-items-left justify-content-left' style={{maxHeight: "15vh"}}  > 
            {/* <hr/>  */}
            <div className="container" style ={{overflow: 'scroll', hight: '17%'}} >
                { visible && props.errorList.map((d) => (
                <div key={d[1]}>
                    {d[0]}  &nbsp; {d[1]}
                </div>
                ))
                }
            </div>
           </Container>
        </div>

    )

}

export default ErrorList