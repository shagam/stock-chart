import React from 'react'

export const GlobalFilter = ({name, filter, setFilter}) => {
  return (
    <span>
      {name}: {' '}
      <input style={{width: '15vw'}} value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </span>
  )
}

export default GlobalFilter