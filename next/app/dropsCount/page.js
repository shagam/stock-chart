"use client";

import {DropsCount} from "../../table/DropsCount";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";

export default function DropsCountPage(props) {

  return (
    <DropsCount
      symbol= {memoryStore.get('chartSymbol')}
      setDropStartDate={memoryStore.get('setDropStartDate')}
      stockChartXValues={memoryStore.get('stockChartXValues')}
      stockChartYValues={memoryStore.get('stockChartYValues')}
      errorAdd={memoryStore.get('errorAdd')}
      daily={memoryStore.get('daily')}
      eliHome={memoryStore.get('eliHome')} 
    />
  );
}
