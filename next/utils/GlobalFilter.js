import React from 'react'

export const GlobalFilter = ({name, filter, setFilter, isMobile, marginTop}) => {
  return (
    <span style={{display:'flex'}}>
      {/* {name}:&nbsp; {' '} */}
      <input style={{width: '110px', height: '30px', marginTop: marginTop}} placeholder={name} value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </span>
  )
}

export default GlobalFilter