export const COLUMNS = [
  {
    Header: 'symbol',
    Footer: 'symbol',    
    accessor: 'symbol',
    sticky: 'left'
  },
  {
    Header: '%',
    Footer: '%',    
    accessor: 'percent',
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
    Header: "Sector",
    Footer: "Sector",    
    accessor: "Sector"
  },
  {
    Header: 'Cap',
    Footer: 'Cap',    
    accessor: 'Cap'
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
    Header: 'Mon',
    Footer: 'Mon',   
    accessor: 'mon'
  },
  {
    Header: '3Mn',
    Footer: '3Mn',    
    accessor: 'mon3'
  },
  {
    Header: '6Mn',
    Footer: '6Mn',   
    accessor: 'mon6'
  },
  {
    Header: 'Yr',
    Footer: 'Yr',
    accessor: 'year'
  },
  {
    Header: '2Yr',
    Footer: '2Yr',
    accessor: 'year2',
  },
  {
    Header: '5Yr',
    Footer: '5Yr',    
    accessor: 'year5'
  },
  {
    Header: '10Yr',
    Footer: '10Yr',    
    accessor: 'year10'
  },
  {
    Header: '20Yr',
    Footer: '20Yr',    
    accessor: 'year20'
  },
  {
    Header: 'short',
    Footer: 'short',    
    accessor: 'short'
  },
  {
    Header: 'Long',
    Footer: 'Long',    
    accessor: 'peak2Peak'
  },
  {
    Header: 'splits_list',
    Footer: 'splis_list',    
    accessor: 'splits_list'
  },
  {
    Header: 'splits',
    Footer: 'splits',    
    accessor: 'splits'
  },
  {
    Header: 'gain_date',
    Footer: 'gain_date',    
    accessor: 'gain_date'
  },


  {
    Header: 'deep',
    Footer: 'deep',    
    accessor: 'deep'
  },
  {
    Header: 'recoverWeek',
    Footer: 'recoverWeek',    
    accessor: 'recoverWeek'
  },
  {
    Header: 'deepDate',
    Footer: 'deepDate',    
    accessor: 'deepDate'
  },
  {
    Header: 'price',
    Footer: 'price',    
    accessor: 'price'
  },
  {
    Header: 'price/high',
    Footer: 'price/high',    
    accessor: 'priceDivHigh'
  },
  {
    Header: 'sym',
    Footer: 'sym',    
    accessor: 'sym',
  },
 

] 



export const GROUPED_COLUMNS = [
  {
    Header: 'Info',
    Footer: 'Info',
    accessor: 'Info',       
    columns: [
      {
        Header: 'symbol',
        Footer: 'symbol',    
        accessor: 'symbol',
        sticky: 'left'
      },
      {
        Header: '%',
        Footer: '%',    
        accessor: 'percent',
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
        Header: "Sector",
        Footer: "Sector",    
        accessor: "Sector"
      },    
      {
        Header: 'Cap',
        Footer: 'Cap',    
        accessor: 'Cap'
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
    Header: 'gain: (factor, yearPercent)',
    Footer: 'gain: (factor, yearPercent)',
    accessor: 'gain',   
    columns: [
      {
        Header: '-',
        Footer: '-',    
        accessor: 'gap'
      },
      {
        Header: 'Mon',
        Footer: 'Mon',  
        accessor: 'mon'
      },
      {
        Header: '3Mn',
        Footer: '3Mn',    
        accessor: 'mon3'
      },
      {
        Header: '6Mn',
        Footer: '6Mn',   
        accessor: 'mon6'
      },
      {
        Header: 'Yr',
        Footer: 'Yr',
        accessor: 'year'
      },
      {
        Header: '2Yr',
        Footer: '2Yr',
        accessor: 'year2',
      },
      {
        Header: '5Yr',
        Footer: '5Yr',    
        accessor: 'year5'
      },
      {
        Header: '10Yr',
        Footer: '10Yr',    
        accessor: 'year10'
      },
      {
        Header: '20Yr',
        Footer: '20Yr',    
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
        accessor: 'splits'
      },
      {
        Header: 'gain_date',
        Footer: 'gain_date',    
        accessor: 'gain_date'
      },    
    ]
  },

  {
    Header: 'gain-yearly',
    Footer: 'gain-yearly',
    accessor: 'yearly',   
    columns: [
      {
        Header: 'Short',
        Footer: 'Short',    
        accessor: 'short'
      },  
      {
        Header: 'Long',
        Footer: 'Long',    
        accessor: 'peak2Peak'
      }
    ]
  },

  {
    Header: 'deep-recover',
    Footer: 'deep-recover',
    accessor: 'deep-recover',   
    columns: [
      {
        Header: 'deep',
        Footer: 'deep',    
        accessor: 'deep'
      },
      {
        Header: 'recoverWeek',
        Footer: 'recoverWeek',    
        accessor: 'recoverWeek'
      },
      {
        Header: 'deepDate',
        Footer: 'deepDate',    
        accessor: 'deepDate'
      },
      {
        Header: 'price',
        Footer: 'price',    
        accessor: 'price'
      }, 
      {
        Header: 'price/high',
        Footer: 'price/high',    
        accessor: 'priceDivHigh'
      },
    
    ]
  },
  {
    Header: '',
    Footer: '',
    accessor: 'sym',   
    columns: [
      {
        Header: 'sym',
        Footer: 'sym',    
        accessor: 'sym',
        sticky: 'right'
      },

    ]
  }

]

