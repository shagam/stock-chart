"use client";

import Contact from "../../auth/Contact";   // adjust path if needed
import memoryStore from "../../components/MemoryStore"; // adjust path if needed

export default function Client() {


  return (
    <Contact
      server={memoryStore.get('servSelect')}
      ssl={memoryStore.get('ssl')}
      PORT={memoryStore.get('PORT')}
    />
  );
}
