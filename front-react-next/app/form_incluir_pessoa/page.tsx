'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { useAuthToken } from "../hooks/useAuthToken";
import { apiUrl } from "../lib/api";
import { updateAuthToken } from "../lib/auth";

export default function FormIncluirPessoa() {

  const [nome, setNome] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [senha, setSenha] = useState<string>("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { token, isReady } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/form_login");
    }
  }, [isReady, router, token]);

  useEffect(() => {
    // se não houver mensagem, encerra
    if (!message) return;

    // exibe a mensagem por 5 segundos
    const timer = setTimeout(() => {
      setMessage("");
    }, 5000);
    return () => clearTimeout(timer);

  }, [message]);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      setError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const enviar = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setMessage("");
    setError("");

    setLoading(true);

    try {

      const resposta = await fetch(apiUrl('/pessoa'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nome, email, telefone, login, senha })
      });

      switch (resposta.status) {
        case 200:
        case 201:
          setMessage("Pessoa cadastrada com sucesso!");
          // limpa os campos
          setNome(""); setEmail(""); setTelefone("");
          setLogin(""); setSenha("");
          break;
        case 400:
          setError("Invalid data.");
          break;
        case 401:
          setError("A sessão expirou. Por favor, faça login novamente!");
          updateAuthToken(null);
          router.replace("/form_login");
          break;
        case 403:
          setError("Você não tem permissão para realizar esta ação.");
          break;
        case 500:
          setError("Erro interno no servidor backend.");
          break;
        default:
          const resultado = await resposta.json();
          setError(resultado.message || "Um erro inesperado ocorreu.");
      }
  } catch (error) {
    console.log('error', error);
    setError("Não foi possível conectar-se ao backend");
  } finally {
    setLoading(false);
  }
}

// se não houver token, encerra a página
if (!isReady || !token) {
  return null;
}


return (
  <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">

      <h1
      className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
      >Cadastrar Pessoa</h1>

      {message && (
        <p className="text-green-600 font-medium">
          {message}
        </p>
      )}

      {error && (
        <p className="text-red-600 font-medium">
          {error}
        </p>
      )}

      <form className="flex flex-col gap-4 w-full" onSubmit={enviar}>

        <input type="text" name="nome"
          placeholder="Nome" value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required />

        <input type="email" name="email" placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

        <input type="text" name="telefone" placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)} 
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

        <input type="text" name="login" placeholder="Login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required />

        <input type="password" name="senha" placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required />

        <button type="submit"
          disabled={loading}
          className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

      </form>

    </main>
  </div>
);
}