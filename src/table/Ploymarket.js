import React, { useEffect, useState } from "react";

import axios from "axios";

// const QQQ_MARKET_ID = "YOUR_QQQ_MARKET_ID_HERE"; 
const QQQ_MARKET_ID = "0x1234567890abcdef1234567890abcdef12345678";

// Example: "0x1234..." — give me your market link and I’ll extract it for you.
// _QqqTrendButton
 function Polymarket() {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrend = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "https://clob.polymarket.com/prices-history",
        {
          params: {
            market: QQQ_MARKET_ID,
            interval: "1h",
            fidelity: "1"
          }
        }
      );

      const history = res.data.history || [];
      console.log("QQQ Trend:", history); // <-- prints to console
      setTrend(history);

    } catch (err) {
      console.error("Error fetching QQQ trend:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={fetchTrend} disabled={loading}>
        {loading ? "Loading…" : "Load QQQ Trend"}
      </button>

      <ul style={{ marginTop: 20 }}>
        {trend.map((point, i) => (
          <li key={i}>
            {new Date(point.t).toLocaleString()} → {point.p}
          </li>
        ))}
      </ul>
    </div>
  );
}



export  {Polymarket};

