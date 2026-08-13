"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  async function findOrder() {
    setError(""); setOrder(null);
    const id = trackingId.trim(); if (!id) return;
    const { data, error: e } = await getSupabase().from("orders").select("*").eq("tracking_id", id).maybeSingle();
    if (e) setError(e.message); else if (!data) setError("Tracking ID not found"); else setOrder(data);
  }

  useEffect(() => {
    if (!order?.id) return;
    const sb = getSupabase();
    const channel = sb.channel(`tracking-${order.id}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` }, p => setOrder(p.new)).subscribe();
    return () => { sb.removeChannel(channel); };
  }, [order?.id]);

  return <main style={{padding:32,fontFamily:"Arial",background:"#f5f6f8",minHeight:"100vh"}}><h1>BM XPRESS Live Tracking</h1><div style={{background:"white",padding:20,borderRadius:12,maxWidth:700}}><input value={trackingId} onChange={e=>setTrackingId(e.target.value)} placeholder="Enter tracking ID" style={{padding:12,width:"70%"}}/><button onClick={findOrder} style={{padding:12,marginLeft:8}}>Track</button>{error&&<p>{error}</p>}{order&&<div><h2>{order.tracking_id}</h2><p><b>Status:</b> {order.status}</p><p><b>Customer:</b> {order.customer_name??"-"}</p><p><b>Pickup:</b> {order.pickup_address??"-"}</p><p><b>Delivery:</b> {order.drop_address??"-"}</p></div>}</div></main>;
}
