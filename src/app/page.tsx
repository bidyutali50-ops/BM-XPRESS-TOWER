"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function Home() {
  const [orders, setOrders] = useState<any[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    const channel = sb.channel("bmx-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        setOrders((current) => {
          if (payload.eventType === "INSERT") return [payload.new, ...current];
          if (payload.eventType === "UPDATE") return current.map((o) => o.id === payload.new.id ? payload.new : o);
          return current.filter((o) => o.id !== payload.old.id);
        });
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    sb.from("orders").select("*").order("updated_at", { ascending: false }).limit(500)
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message);
        else setOrders(data ?? []);
      });

    return () => { sb.removeChannel(channel); };
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "Arial", background: "#f5f6f8", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h1>BM XPRESS Control Tower</h1><p>Live logistics operations</p></div>
        <strong style={{ color: live ? "#059669" : "#d97706" }}>● {live ? "REALTIME CONNECTED" : "CONNECTING..."}</strong>
      </div>
      <div style={{ background: "white", padding: 20, borderRadius: 12, overflowX: "auto" }}>
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        <h2>Live Orders ({orders.length})</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Order</th><th>Tracking</th><th>Customer</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>{orders.map((o) => <tr key={o.id}>
            <td>{o.external_order_id ?? "-"}</td><td>{o.tracking_id ?? "-"}</td><td>{o.customer_name ?? "-"}</td><td>{o.status ?? "-"}</td><td>{o.updated_at ? new Date(o.updated_at).toLocaleString() : "-"}</td>
          </tr>)}</tbody>
        </table>
        {!orders.length && !error && <p>No orders yet.</p>}
      </div>
    </main>
  );
}
