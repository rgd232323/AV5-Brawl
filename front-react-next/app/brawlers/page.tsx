"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthToken } from "../hooks/useAuthToken";
import { apiUrl } from "../lib/api";
import { updateAuthToken } from "../lib/auth";

type Brawler = {
  id: number;
  nome: string;
  classe: string;
  velocidade: string;
  descricao: string;
};

type BrawlerForm = Omit<Brawler, "id">;

function isBrawlerList(value: unknown): value is Brawler[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "number" &&
        "nome" in item &&
        typeof item.nome === "string" &&
        "classe" in item &&
        typeof item.classe === "string" &&
        "velocidade" in item &&
        typeof item.velocidade === "string" &&
        "descricao" in item &&
        typeof item.descricao === "string",
    )
  );
}

const EMPTY_FORM: BrawlerForm = {
  nome: "",
  classe: "",
  velocidade: "",
  descricao: "",
};

async function readResponse(response: Response) {
  const data: unknown = await response.json().catch(() => null);
  if (
    !response.ok ||
    !data ||
    typeof data !== "object" ||
    !("resultado" in data) ||
    data.resultado !== "ok"
  ) {
    throw new Error(
      typeof data === "object" &&
        data !== null &&
        "detalhes" in data &&
        typeof data.detalhes === "string"
        ? data.detalhes
        : "Não foi possível concluir a solicitação.",
    );
  }
  return data;
}

export default function BrawlersPage() {
  const { token, isReady } = useAuthToken();
  const router = useRouter();
  const [brawlers, setBrawlers] = useState<Brawler[]>([]);
  const [form, setForm] = useState<BrawlerForm>(EMPTY_FORM);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listError, setListError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBrawlers = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(apiUrl("/brawlers"), {
      cache: "no-store",
      signal,
    });
    const data = await readResponse(response);
    if (
      typeof data !== "object" ||
      data === null ||
      !("detalhes" in data) ||
      !isBrawlerList(data.detalhes)
    ) {
      throw new Error("O backend retornou uma lista inválida.");
    }
    return data.detalhes;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBrawlers(controller.signal)
      .then((items) => {
        setBrawlers(items);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setListError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os brawlers.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false);
      });
    return () => controller.abort();
  }, [fetchBrawlers]);

  async function loadBrawlers() {
    setLoadingList(true);
    setListError("");
    try {
      setBrawlers(await fetchBrawlers());
    } catch (error: unknown) {
      setListError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os brawlers.",
      );
    } finally {
      setLoadingList(false);
    }
  }

  function updateField(field: keyof BrawlerForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createBrawler(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setListError("");

    if (!token) {
      router.push("/form_login");
      return;
    }

    const values: BrawlerForm = {
      nome: form.nome.trim(),
      classe: form.classe.trim(),
      velocidade: form.velocidade.trim(),
      descricao: form.descricao.trim(),
    };
    if (Object.values(values).some((value) => !value)) {
      setFormError("Preencha todos os campos antes de cadastrar.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(apiUrl("/brawlers"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      if (response.status === 401) {
        updateAuthToken(null);
        router.replace("/form_login");
        throw new Error("Sua sessão expirou. Entre novamente para cadastrar.");
      }
      await readResponse(response);
      setForm(EMPTY_FORM);
      setSuccess("Brawler cadastrado com sucesso.");
      await loadBrawlers();
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        setFormError(error.message);
      } else {
        setFormError("Não foi possível conectar ao backend.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Brawlers
        </h1>
        <p className="mt-2 text-gray-600">
          Consulte os brawlers cadastrados e, se estiver autenticado, adicione novos.
        </p>
      </header>

      {isReady && token ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Cadastrar brawler
          </h2>
          <form onSubmit={createBrawler} className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Nome
              <input
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                maxLength={200}
                required
                className="rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Classe
              <input
                value={form.classe}
                onChange={(event) => updateField("classe", event.target.value)}
                maxLength={200}
                required
                className="rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium text-gray-700">
              Velocidade
              <input
                value={form.velocidade}
                onChange={(event) => updateField("velocidade", event.target.value)}
                maxLength={200}
                required
                className="rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>
            <label className="flex flex-col gap-1 font-medium text-gray-700 sm:col-span-2">
              Descrição
              <textarea
                value={form.descricao}
                onChange={(event) => updateField("descricao", event.target.value)}
                maxLength={200}
                rows={3}
                required
                className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </label>

            {formError && (
              <p role="alert" className="text-sm text-red-700 sm:col-span-2">
                {formError}
              </p>
            )}
            {success && (
              <p role="status" className="text-sm text-green-700 sm:col-span-2">
                {success}
              </p>
            )}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Cadastrando..." : "Cadastrar brawler"}
              </button>
            </div>
          </form>
        </section>
      ) : isReady ? (
        <aside className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-950 sm:flex-row sm:items-center sm:justify-between">
          <p>Entre para cadastrar brawlers. A listagem continua pública.</p>
          <Link
            href="/form_login"
            className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          >
            Entrar para cadastrar
          </Link>
        </aside>
      ) : null}

      <section aria-labelledby="brawler-list-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            id="brawler-list-heading"
            className="text-xl font-semibold text-gray-900"
          >
            Brawlers cadastrados
          </h2>
          <button
            type="button"
            onClick={() => void loadBrawlers()}
            disabled={loadingList}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {loadingList ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {listError && (
          <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            <p>{listError}</p>
            <button
              type="button"
              onClick={() => void loadBrawlers()}
              className="mt-2 font-semibold underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loadingList && !listError ? (
          <p role="status" className="py-8 text-center text-gray-600">
            Carregando brawlers...
          </p>
        ) : !listError && brawlers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-gray-600">
            Ainda não há brawlers cadastrados.
          </p>
        ) : (
          brawlers.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {brawlers.map((brawler) => (
                <li
                  key={brawler.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{brawler.nome}</h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      {brawler.classe}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">Velocidade:</span>{" "}
                    {brawler.velocidade}
                  </p>
                  <p className="mt-3 break-words text-sm leading-6 text-gray-700">
                    {brawler.descricao}
                  </p>
                </li>
              ))}
            </ul>
          )
        )}
      </section>
    </main>
  );
}
