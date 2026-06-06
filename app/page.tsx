"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");
  const [income, setIncome] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);

  // AUTH CHECK
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) router.push("/login");
      else setUser(data.user);
    };

    checkUser();
  }, []);

  // LOGOUT
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // FETCH
     const fetchExpenses = async () => {
     const { data } = await supabase
        .from("expenses")
        .select("*")
       .eq("user_id", user.id)
       .order("id", { ascending: false });

      setExpenses(data || []);
    };

  useEffect(() => {
     if (user) {
       fetchExpenses();
       fetchIncome();
     }
    }, [user]);

    const fetchIncome = async () => {
     const { data } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id);

     const total =
       data?.reduce(
         (sum, item) => sum + Number(item.amount),
         0
       ) || 0;

    setTotalIncome(total);
  };

  // ADD
  const addExpense = async () => {
    if (!name || !amount) return;

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

  const addIncome = async () => {
  if (!income) return;

  const { error } = await supabase
     .from("income")
     .insert([
        {
          amount: Number(income),
          user_id: user.id,
        },
      ]);

    if (error) {
      alert(error.message);
      console.log(error);
      return;
    }

    setIncome("");
    await fetchIncome();
  };

  // DELETE
  const deleteExpense = async (id: number) => {
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
  };

  

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const currentMonth = new Date().getMonth();

  const monthlyTotal = expenses
         .filter(
          (e) =>
          new Date(e.created_at).getMonth() === currentMonth
    )
    .reduce((sum, e) => sum + Number(e.amount), 0);

    const balance = totalIncome - total;

  // CHART DATA
  const chartData = expenses.reduce((acc: any[], cur) => {
    const cat = cur.category || "other";

    const found = acc.find((a) => a.name === cat);

    if (found) found.value += Number(cur.amount);
    else acc.push({ name: cat, value: Number(cur.amount) });

    return acc;
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      padding: 20,
      background: dark ? "#0f172a" : "#f5f7fb",
      color: dark ? "white" : "black"
    }}>
      
      {/* TOP */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>💰 Dashboard</h2>

        <div>
          <button onClick={() => setDark(!dark)}>🌙</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <div style={{ flex: 1, padding: 15, background: dark ? "#1e293b" : "white", borderRadius: 10 }}>
          <h4>Total</h4>
          <h2>₹{total}</h2>
        </div>

        <div style={{ flex: 1, padding: 15, background: dark ? "#1e293b" : "white", borderRadius: 10 }}>
          <h4>Items</h4>
          <h2>{expenses.length}</h2>
        </div>

        <div
          style={{
          flex: 1,
          padding: 15,
          background: dark ? "#1e293b" : "white",
          borderRadius: 10
      }}
      >
          <h4>This Month</h4>
          <h2>₹{monthlyTotal}</h2>
      </div>

      <div
         style={{
         flex: 1,
         padding: 15,
         background: dark ? "#1e293b" : "white",
         borderRadius: 10
         }}
>
         <h4>Total Income</h4>
         <h2>₹{totalIncome}</h2>
       </div>

      <div
          style={{
          flex: 1,
          padding: 15,
          background: dark ? "#1e293b" : "white",
          borderRadius: 10
        }}
>
        <h4>Balance</h4>
        <h2>₹{balance}</h2>
      </div>
      </div>

      {/* INPUT */}
      <div style={{ marginTop: 15, padding: 15, background: dark ? "#1e293b" : "white", borderRadius: 10 }}>
        <input placeholder="Name"  value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />

        <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 10 }} />

        <select
               value={category}
               onChange={(e) => setCategory(e.target.value)}
               style={{ width: "100%", padding: 10, marginBottom: 10 }}
>
               <option value="">Select Category</option>
               <option value="Food">🍔 Food</option>
               <option value="Travel">🚗 Travel</option>
               <option value="Shopping">🛒 Shopping</option>
               <option value="Bills">💡 Bills</option>
               <option value="Entertainment">🎬 Entertainment</option>
               <option value="Other">📦 Other</option>
         </select>

        <input
             placeholder="Income Amount"
             type="number"
             value={income}
             onChange={(e) => setIncome(e.target.value)}
             style={{
             width: "100%",
             padding: 10,
             marginBottom: 10
          }}
     />

       <button
               onClick={addIncome}
               style={{
               width: "100%",
               marginBottom: 10
          }}
>
         Add Income
      </button>

        <button onClick={addExpense} style={{ width: "100%" }}>Add Expense</button>
      </div>

      {/* CHART */}
      <div style={{ marginTop: 15, padding: 15, background: dark ? "#1e293b" : "white", borderRadius: 10 }}>
        <h3>📊 Chart</h3>

        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={90}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b"][i % 4]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <input
        placeholder="🔍 Search Expense"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
            width: "100%",
            padding: 10,
            marginTop: 15,
            marginBottom: 15,
            borderRadius: 8
         }}
       />

      {/* LIST */}
      <div style={{ marginTop: 15 }}>
        {expenses
          .filter((e) =>
            e.name.toLowerCase().includes(search.toLowerCase())
     )
     .map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              marginTop: 10,
              background: dark ? "#1e293b" : "white",
              borderRadius: 10
            }}
          >
            <div>
              <b>{e.name}</b>
              <div style={{ fontSize: 12 }}>{e.category}</div>
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