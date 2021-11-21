import React, {useMemo} from 'react'
import { useTable, useSortBy, useGlobalFilter, useRowSelect } from 'react-table'
import MOCK_DATA from './mock-data.json'
import { COLUMNS, GROUPED_COLUMNS } from './columns'
import './table.css'
import GlobalFilter from './GlobalFilter'
import CheckBox from './CheckBox'

export const BasicTable = () => {

  const columns = useMemo(() => GROUPED_COLUMNS, []) 
  const data = useMemo(() => MOCK_DATA, [])


  const tableInstance = useTable ({
    columns,
    data
  })

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
    selectedFlatRows,
  } = useTable ({
    columns,
    data,
  },
  useGlobalFilter, useSortBy, useRowSelect, (hooks) => {
    hooks.visibleColumns.push((columns) => {
      return [
        {
          id: 'selection',
          Header: ({getToggleAllRowsSelectedProps}) => (
            <CheckBox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({row}) => (
            <CheckBox {...row.getToggleRowSelectedProps()} />
          )
        }, 
        ...columns
      ]
    })
  })

  const { globalFilter } = state

  return (
    <>
    <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter}/>
    <table {...getTableProps()}>
      <thead>
        {headerGroups.map ((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>{column.render('Header')} 
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' V ' : ' A ') : ''} 
                  </span>
                  </th>
              ))}
            </tr>
        ))}
      </thead>
    
      <tbody {...getTableBodyProps()}>
        {
          rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
      </tbody>

    </table>
    <pre>
      <code>
        {JSON.stringify (
          {
            selectedFlatRows: selectedFlatRows.map((row) => row.original),
          },
          null,
          2
        )}
      </code>
    </pre>
    </>
  )
}
