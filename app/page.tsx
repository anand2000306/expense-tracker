"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dark, setDark] = useState(true);

  // AUTH (SAFE)
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // LOGIN
  const login = async () => {
    const email = prompt("Email");
    const password = prompt("Password");

    const { error } = await supabase.auth.signInWithPassword({
      email: email!,
      password: password!,
    });

    if (error) alert(error.message);
  };

  // SIGNUP
  const signup = async () => {
    const email = prompt("Email");
    const password = prompt("Password");

    const { error } = await supabase.auth.signUp({
      email: email!,
      password: password!,
    });

    if (error) alert(error.message);
    else alert("Signup done → Now login bro 😎");
  };

  // LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // FETCH
  const fetchExpenses = async () => {
    const { data } = await supabase
      .from("expenses")
      .select("*")
      .order("id", { ascending: false });

    setExpenses(data || []);
  };

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  // ADD
  const addExpense = async () => {
    if (!name || !amount) return alert("Fill all fields");

    await supabase.from("expenses").insert([
      {
        name,
        amount: Number(amount),
        category: category || "other",
        user_id: user.id,
      },
    ]);

    setName("");
    setAmount("");
    setCategory("");
    fetchExpenses();
  };

  // DELETE
  const deleteExpense = async (id: number) => {
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  // SAFE CHART DATA
  const chartData = expenses.reduce((acc: any[], cur) => {
    const cat = cur.category || "other";

    const found = acc.find((a) => a.name === cat);

    if (found) {
      found.value += Number(cur.amount);
    } else {
      acc.push({
        name: cat,
        value: Number(cur.amount),
      });
    }

    return acc;
  }, []);

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h1>💰 Expense Tracker</h1>
        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 20,
        background: dark ? "#0f172a" : "#f5f7fb",
        color: dark ? "white" : "black",
        fontFamily: "Arial",
      }}
    >
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>💰 Dashboard</h2>
        <div>
          <button onClick={() => setDark(!dark)}>🌙</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* CARDS */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <div
          style={{
            flex: 1,
            padding: 15,
            background: dark ? "#1e293b" : "white",
            borderRadius: 12,
          }}
        >
          <h4>Total</h4>
          <h2>₹{total}</h2>
        </div>

        <div
          style={{
            flex: 1,
            padding: 15,
            background: dark ? "#1e293b" : "white",
            borderRadius: 12,
          }}
        >
          <h4>Items</h4>
          <h2>{expenses.length}</h2>
        </div>
      </div>

      {/* INPUT */}
      <div
        style={{
          marginTop: 15,
          padding: 15,
          background: dark ? "#1e293b" : "white",
          borderRadius: 12,
        }}
      >
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button onClick={addExpense} style={{ width: "100%" }}>
          Add Expense
        </button>
      </div>

      {/* CHART */}
      <div
        style={{
          marginTop: 15,
          padding: 15,
          background: dark ? "#1e293b" : "white",
          borderRadius: 12,
        }}
      >
        <h3>📊 Spending Chart</h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={90}>
              {chartData.map((item: any, i: number) => (
                <Cell
                  key={i}
                  fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][i % 4]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* LIST */}
      <div style={{ marginTop: 15 }}>
        {expenses.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 12,
              marginBottom: 10,
              borderRadius: 10,
              background: dark ? "#1e293b" : "white",
            }}
          >
            <div>
              <b>{e.name}</b>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {e.category}
              </div>
            </div>

            <div>
              ₹{e.amount}
              <button onClick={() => deleteExpense(e.id)}>❌</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}