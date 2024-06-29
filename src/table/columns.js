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
    Header: 'price',
    Footer: 'price',    
    accessor: 'price'
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
    Header: 'verifyDate',
    Footer: 'verifyDate',    
    accessor: 'verifyDate'
  },
  {
    Header: 'verifyPrice',
    Footer: 'verifyPrice',
    accessor: 'verifyPrice',
  },
  {
    Header: 'verify_1',
    Footer: 'verify_1',    
    accessor: 'verify_1'
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
      {
        Header: '%',
        Footer: '%',    
        accessor: 'percent',
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
    Header: 'gain-factor',
    Footer: 'gain-factor',
    accessor: 'gain',   
    columns: [
      {
        Header: '-',
        Footer: '-',    
        accessor: 'gap'
      },
      {
        Header: 'price',
        Footer: 'price',    
        accessor: 'price'
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
        Header: 'price/high',
        Footer: 'price/high',    
        accessor: 'priceDivHigh'
      },
    
    ]
  },
  {
    Header: 'verify',
    Footer: 'verify',
    accessor: 'verify',   
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
        Header: 'verifyDate',
        Footer: 'verifyDate',    
        accessor: 'verifyDate'
      },
      {
        Header: 'verifyPrice',
        Footer: 'verifyPrice',
        accessor: 'verifyPrice',
      },
      {
        Header: 'verify_1',
        Footer: 'verify_1',    
        accessor: 'verify_1'
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

