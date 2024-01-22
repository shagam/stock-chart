import React, {useState} from 'react'
// import ComboBox from 'react-responsive-combo-box'
// import 'react-responsive-combo-box/dist/index.css'
import Dropdown from 'react-bootstrap/Dropdown';
import { Container } from 'react-bootstrap'

function ErrorList (props) {
    const [visible, setVisible] = useState(false)
    const str ="<div style ={{color: 'red'}}> red </div>"
    // style={{display: 'flex'}}

    function concat (arr) {
        var txt = '';
        arr.forEach ((t) => {txt += t + '  '})
        return txt;
    }

    return (  
  
        <div  >   
            <div style={{color: 'red'}}>
                <input 
                    type="checkbox" checked={visible}
                    onChange={() => {setVisible (!visible)}}
                /> errors ({props.errorList.length})
            </div>

            <Container  className='d-flex align-items-left justify-content-left' style={{maxHeight: "15vh", padding: '0px', margin:'0px'}}  > 
            {/* <hr/>  */}
            <div className="container" style ={{overflow: 'scroll', hight: '17%'}} >
                { visible && props.errorList.map((err) => (
                    // display each err in array in one line
                <div key={concat(err)} style ={{display: 'flex'}} >
                    <div> {concat (err)} </div> 
                </div>
                ))
                }
            </div>
           </Container>
        </div>

    )

}

var a=new AudioContext() // browsers limit the number of concurrent audio contexts, so you better re-use'em

function beep(vol, freq, duration){
  var v=a.createOscillator()
  var u=a.createGain()
  v.connect(u)
  v.frequency.value=freq
  v.type="square"
  u.connect(a.destination)
  u.gain.value=vol*0.01
  v.start(a.currentTime)
  v.stop(a.currentTime+duration*0.001)
}



export {ErrorList, beep}