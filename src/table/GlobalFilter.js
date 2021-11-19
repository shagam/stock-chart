import React from 'react'

export const GlobalFilter = ({filter, setFilter}) => {
  return (
    <span>
      Seaarch: {' '}
      <input value={filter || ''} onChange={e => setFilter(e.target.value)} />
    </span>
  )
}

export default GlobalFilter