import React from 'react'

export const GlobalFilter = ({name, filter, setFilter, isMobile}) => {
  return (
    <span>
      {name}: {' '}
      <input style={{width: '150px'}} value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </span>
  )
}

export default GlobalFilter