import React, {useState} from 'react'
// import MobileContext from './MobileContext';


export const ServerSelect = (props) => {
  // props.setServ
  // props.defaultValue  missing
  // props.title
  // props.options

  const servList = ['localhost', '84.95.84.236', 'stocks.dinagold.org'];
  const [serv, setServ] = useState (props.options[0])

  const LOG = false;
  function onChangeInput (value) {
    props.setCategory(value.value)
    // console.log (value)
  }
  function exec (e) {
    setServ (e.target.value);
    props.setServ (e.target.value);
    if (LOG)
      console.log('server:', e.target.value)
  }
  // const categoryOptions = [
  //   {label: 'all', value: 'all'},
  //   {label: 'Landscape', value: 'Landscape'},
  //   {label: 'Structure', value: 'Structure'},
  //   {label: 'Nature', value: 'Nature'},
  //   {label: 'Fabrique', value: 'Fabrique'},
  //   {label: 'Other', value: 'Other'},
  // ]

  // getIndex of default category
  // function searchInitialCategory (cat) {
  //   for (var i = 0; i < categoryOptions.length; i++) {
  //     if (categoryOptions[i].value === cat)
  //       return i;
  //   }
  //   return 0; // default is all
  // }

//  const { isAndroid } = MobileContext();

  var style = {};
  // if (! isAndroid)
  //   style = {display: 'flex', color: 'red',
  //  zoom: '150%'}
  // else
  //   style = {display: 'flex'}

  const oldMode = false;
  return (
    <>
  <div> {props.title};&nbsp;;&nbsp;</div>
    {<div style={{display: 'flex'}}>
    {/* category: &nbsp;&nbsp;&nbsp; */}
    {props.options.map((servSel) => (
      <div key = {servSel}  style={style} >
        <input  type='radio' style={{zoom: '150%', display: 'flex'}} name={props.title} value={servSel} checked={serv === servSel} onChange={exec} /> 
        <div>{servSel}&nbsp;&nbsp;&nbsp;&nbsp;</div>
      </div>
    ))}
  </div>}
  </>
  )
}

export default ServerSelect;