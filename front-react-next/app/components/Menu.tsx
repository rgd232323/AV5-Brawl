"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthToken } from "../hooks/useAuthToken";
import { updateAuthToken } from "../lib/auth";

export default function Menu() {
  const { token, isReady } = useAuthToken();
  const router = useRouter();

  function logout() {
    updateAuthToken(null);
    router.push("/brawlers");
  }

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <ul className="flex flex-wrap items-center gap-4 sm:gap-6">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/listar_pessoas">Listar pessoas</Link></li>
        <li><Link href="/brawlers">Brawlers</Link></li>
        <li><Link href="/form_incluir_pessoa">Nova Pessoa</Link></li>
        {!isReady || !token ? (
          <li><Link href="/form_login">Login</Link></li>
        ) : (
          <li>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer underline underline-offset-4"
            >
              Sair
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}