import React from 'react'

export const GlobalFilter = ({name, filter, setFilter, isMobile}) => {
  return (
    <span style={{display:'flex'}}>
      {/* {name}:&nbsp; {' '} */}
      <input style={{width: '110px', height: '28px', marginTop: '17px'}} placeholder={name} value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </span>
  )
}

export default GlobalFilter