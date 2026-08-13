"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [orders, setOrders] = useState<any[]>([]);
  const [live, setLive] = useState(false);

  useEffect(() => {
    supabase.from("orders").select("*").order("updated_at", { ascending: false }).limit(500).then(({ data }) => setOrders(data ?? []));
    const channel = supabase.channel("bmx-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        setOrders((current) => {
          if (payload.eventType === "INSERT") return [payload.new, ...current];
          if (payload.eventType === "UPDATE") return current.map((o) => o.id === payload.new.id ? payload.new : o);
          return current.filter((o) => o.id !== payload.old.id);
        });
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main style={{ padding: 32, fontFamily: "Arial", background: "#f5f6f8", minHeight: "100vh" }}>
      <h1>BM XPRESS Control Tower</h1>
      <p>Realtime: {live ? "CONNECTED" : "CONNECTING..."}</p>
      <div style={{ background: "white", padding: 20, borderRadius: 12 }}>
        <h2>Live Orders ({orders.length})</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th>Order</th><th>Tracking</th><th>Customer</th><th>Status</th><th>Updated</th></tr></thead>
          <tbody>{orders.map((o) => <tr key={o.id}>
            <td>{o.external_order_id}</td><td>{o.tracking_id}</td><td>{o.customer_name ?? "-"}</td><td>{o.status}</td><td>{new Date(o.updated_at).toLocaleString()}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </main>
  );
}
