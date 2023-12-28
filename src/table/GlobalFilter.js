import React from 'react'

export const GlobalFilter = ({name, filter, setFilter, isMobile}) => {
  return (
    <span style={{display:'flex'}}>
      {name}:&nbsp; {' '}
      <input style={{width: '150px', hight: '4px'}} value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </span>
  )
}

export default GlobalFilter