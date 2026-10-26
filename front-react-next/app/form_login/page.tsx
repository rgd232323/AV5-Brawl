// esta página será um componente de CLIENTE
// isso é necessário para poder ARMAZENAR ESTADO
// que estado?
// - login e senha: variáveis que estão relacionadas com elementos da tela
// - mensagem de erro
// - token
'use client';

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthToken } from "../hooks/useAuthToken";
import { apiUrl } from "../lib/api";
import { updateAuthToken } from "../lib/auth";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, isReady } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/brawlers");
    }
  }, [router, token]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resposta = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });
      const dados = await resposta.json();
      const novoToken = dados?.detalhes?.token;

      if (!resposta.ok || dados?.resultado !== "ok" || typeof novoToken !== "string") {
        throw new Error(dados?.detalhes || "Não foi possível entrar.");
      }
      updateAuthToken(novoToken);
      router.replace("/brawlers");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return <main className="mx-auto w-full max-w-md p-6">Carregando...</main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900">Login</h1>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      {token ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="mb-4 text-gray-700">Você está autenticado.</p>
          <Link href="/brawlers" className="font-semibold text-blue-700 underline">
            Ir para Brawlers
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <label className="flex flex-col gap-1 font-medium text-gray-700">
            Usuário
            <input
              type="text"
              autoComplete="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
          <label className="flex flex-col gap-1 font-medium text-gray-700">
            Senha
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      )}
    </main>
  );
}