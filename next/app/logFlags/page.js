"use client";

import LogFlags from "../../utils/LogFlags";   // adjust path if needed
import memoryStore from "../../components/MemoryStore";
export default function LogFlagsPage(props) {


  return (
    <LogFlags
      setLogFlags={memoryStore.get('setLogFlags')}
      checkList={memoryStore.get('checkList')}
    />
  );
}
