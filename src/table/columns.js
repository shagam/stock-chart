export const COLUMNS = [
  {
    Header: 'symbol',
    Footer: 'symbol',    
    accessor: 'symbol',
    sticky: 'left'
  },
  {
    Header: 'Exch',
    Footer: 'Exch',    
    accessor: 'Exchange'
  },
  {
    Header: 'Industry',
    Footer: 'Industry',    
    accessor: 'Industry'
  },
  {
    Header: 'PE',
    Footer: 'PE',
    accessor: 'PE'
  },
  {
    Header: 'PE(F)',
    accessor: 'ForwPE'
  },  
  {
    Header: 'PE(TTM)',
    accessor: 'TrailPE'
  },
  {
    Header: 'PEG',
    Footer: 'PEG',
    accessor: 'PEG'
  },
  {
    Header: 'Div',
    accessor: 'Div'
  },
  {
    Header: 'BETA',
    Footer: 'BETA',
    accessor: 'BETA'
  },
  {
    Header: 'EV/EBITDA',
    Footer: 'EV/EBITDA',    
    accessor: 'EVToEBITDA'
  },
  {
    Header: 'EV/R',
    Footer: 'EV/R',    
    accessor: 'EVToRevenue'
  },
  {
    Header: 'PriceToBook',
    Footer: 'PriceToBook',    
    accessor: 'PriceToBookRatio'
  },
  {
    Header: 'targt',
    Footer: 'terget',    
    accessor: 'target'
  },
  {
    Header: 'info_date',
    Footer: 'info_date',    
    accessor: 'info_date'
  },
  {
    Header: '-',
    Footer: '-',    
    accessor: 'gap'
  },
  {
    Header: 'wk',
    Footer: 'wk',    
    accessor: 'wk'
  },
  {
    Header: '2wk',
    Footer: '2wk',    
    accessor: 'wk2'
  },  
  {
    Header: 'mn',
    Footer: 'mn',    
    accessor: 'mon'
  },
  {
    Header: '3mn',
    Footer: '3mn',    
    accessor: 'mon3'
  },
  {
    Header: '6mn',
    Footer: '6mn',   
    accessor: 'mon6'
  },
  {
    Header: 'yr',
    Footer: 'yr',
    accessor: 'year'
  },
  {
    Header: '2yr',
    Footer: '2yr',
    accessor: 'year2',
  },
  {
    Header: '5yr',
    Footer: '5yr',    
    accessor: 'year5'
  },
  {
    Header: '10yr',
    Footer: '10yr',    
    accessor: 'year10'
  },
  {
    Header: '20yr',
    Footer: '20yr',    
    accessor: 'year20'
  },
  {
    Header: 'splits_list ??',
    Footer: 'splis_list',    
    accessor: 'splits_list'
  },
  {
    Header: 'splits',
    Footer: 'splits',    
    accessor: 'splits_calc'
  },
  {
    Header: 'gain_date',
    Footer: 'gain_date',    
    accessor: 'gain_date'
  },


  {
    Header: 'alphaDate',
    Footer: 'alphaDate',    
    accessor: 'alphaDate'
  },
  {
    Header: 'alphaPrice',
    Footer: 'alphaPrice',    
    accessor: 'alphaPrice'
  },
   {
    Header: 'googDate',
    Footer: 'googDate',    
    accessor: 'googDate'
  },
  {
    Header: 'googPrice',
    Footer: 'googPrice',
    accessor: 'googPrice',
  },
  {
    Header: 'GOOGCompare',
    Footer: 'GOOGCompare',    
    accessor: 'GOOGCompare'
  },
  {
    Header: 'drop',
    Footer: 'drop',    
    accessor: 'drop'
  },
  {
    Header: 'recoverWeek',
    Footer: 'recoverWeek',    
    accessor: 'recoverWeek'
  },
  {
    Header: 'dropDate',
    Footer: 'dropDate',    
    accessor: 'dropDate'
  },
  {
    Header: 'priceDivHigh',
    Footer: 'priceDivHigh',    
    accessor: 'priceDivHigh'
  },
 

] 



export const GROUPED_COLUMNS = [
  {
    Header: '',
    Footer: '',
    accessor: 'sym',
    sticky: 'left',
    columns: [
      {
        Header: 'symbol',
        Footer: 'symbol',    
        accessor: 'symbol',
        sticky: 'left'
      },
    ],
  },
  {
    Header: 'Info',
    Footer: 'Info',
    accessor: 'Info',       
    columns: [    
      {
        Header: 'Exch',
        Footer: 'Exch',    
        accessor: 'Exchange'
      },
      {
        Header: 'Industry',
        Footer: 'Industry',    
        accessor: 'Industry'
      },
      {
        Header: 'PE',
        Footer: 'PE',
        accessor: 'PE'
      },
      {
        Header: 'PE(F)',
        accessor: 'ForwPE'
      },  
      {
        Header: 'PE(TTM)',
        accessor: 'TrailPE'
      },
      {
        Header: 'PEG',
        Footer: 'PEG',
        accessor: 'PEG'
      },
      {
        Header: 'Div',
        accessor: 'Div'
      },
      {
        Header: 'BETA',
        Footer: 'BETA',
        accessor: 'BETA'
      },
      {
        Header: 'EV/EBITDA',
        Footer: 'EV/EBITDA',    
        accessor: 'EVToEBITDA'
      },
      {
        Header: 'EV/R',
        Footer: 'EV/R',    
        accessor: 'EVToRevenue'
      },
      {
        Header: 'PriceToBook',
        Footer: 'PriceToBook',    
        accessor: 'PriceToBookRatio'
      },
      {
        Header: 'targt',
        Footer: 'terget',    
        accessor: 'target'
      },
      {
        Header: 'info_date',
        Footer: 'info_date',    
        accessor: 'info_date'
      },
 
    ]
  },
  {
    Header: 'gain',
    Footer: 'gain',
    accessor: 'gain',   
    columns: [
      {
        Header: '-',
        Footer: '-',    
        accessor: 'gap'
      },  
      {
        Header: 'wk',
        Footer: 'wk',    
        accessor: 'wk'
      },
      {
        Header: '2wk',
        Footer: '2wk',    
        accessor: 'wk2'
      },  
      {
        Header: 'mn',
        Footer: 'mn',    
        accessor: 'mon'
      },
      {
        Header: '3mn',
        Footer: '3mn',    
        accessor: 'mon3'
      },
      {
        Header: '6mn',
        Footer: '6mn',   
        accessor: 'mon6'
      },
      {
        Header: 'yr',
        Footer: 'yr',
        accessor: 'year'
      },
      {
        Header: '2yr',
        Footer: '2yr',
        accessor: 'year2',
      },
      {
        Header: '5yr',
        Footer: '5yr',    
        accessor: 'year5'
      },
      {
        Header: '10yr',
        Footer: '10yr',    
        accessor: 'year10'
      },
      {
        Header: '20yr',
        Footer: '20yr',    
        accessor: 'year20'
      },
      {
        Header: 'splits_list',
        Footer: 'splis_list',    
        accessor: 'splits_list'
      },
      {
        Header: 'splits',
        Footer: 'splits',    
        accessor: 'splits_calc'
      },
      {
        Header: 'gain_date',
        Footer: 'gain_date',    
        accessor: 'gain_date'
      },    
    ]
  },
  {
    Header: 'drop-recover',
    Footer: 'drop-recover',
    accessor: 'drop-recover',   
    columns: [
      {
        Header: 'drop',
        Footer: 'drop',    
        accessor: 'drop'
      },
      {
        Header: 'recoverWeek',
        Footer: 'recoverWeek',    
        accessor: 'recoverWeek'
      },
      {
        Header: 'dropDate',
        Footer: 'dropDate',    
        accessor: 'dropDate'
      },
      {
        Header: 'priceDivHigh',
        Footer: 'priceDivHigh',    
        accessor: 'priceDivHigh'
      },
    
    ]
  },
  {
    Header: 'gain-compare',
    Footer: 'gain-compare',
    accessor: 'gain-compare',   
    columns: [
      {
        Header: 'alphaDate',
        Footer: 'alphaDate',    
        accessor: 'alphaDate'
      },
      {
        Header: 'alphaPrice',
        Footer: 'alphaPrice',    
        accessor: 'alphaPrice'
      },
       {
        Header: 'googDate',
        Footer: 'googDate',    
        accessor: 'googDate'
      },
      {
        Header: 'googPrice',
        Footer: 'googPrice',
        accessor: 'googPrice',
      },
      {
        Header: 'compare',
        Footer: 'GOOGCompare',    
        accessor: 'GOOGCompare'
      },

    ]
  }
]

