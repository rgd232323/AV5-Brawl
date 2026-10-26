"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [message, setMessage] = useState("Loading...");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token found? Bounce the visitor back to login
      router.push("/login");
      return;
    }

    fetch("http://localhost:5000/api/dashboard", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized access");
      return res.json();
    })
    .then((data) => setMessage(data.message))
    .catch(() => {
      localStorage.removeItem("token"); // clear invalid token
      router.push("/login");
    });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dashboard</h1>
      <p>{message}</p>
      <button onClick={handleLogout} style={{ padding: "8px 16px", marginTop: "20px" }}>
        Log Out
      </button>
    </div>
  );
}
