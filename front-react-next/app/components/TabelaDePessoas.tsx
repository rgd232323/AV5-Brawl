export default async function Retornar_Pessoas() {

    // pegar a variável de ambiente que informa 
    // qual é a URL da API (backend)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // preparação de algumas mensagens de log
    let logs = "Página iniciada, buscando dados de: " + apiUrl + '/pessoas'

    // desabilitar o CACHE para poder pegar os registros de forma atualizada!
    const response = await fetch(apiUrl + '/pessoas', { cache: 'no-store' });

    // acrescentando informações no log
    logs = logs + "; " + ' API disparada; ';

    // variável que vai armazenar os dados da resposta
    let lines = [];

    // se a resposta não foi bem sucedida
    if (!response.ok) {
        // acrescenta mensagem de erro ao log
        logs = logs + 'Erro ao buscar posts, response.ok = false';

    } else {

        // pega a resposta em formato json
        const data = await response.json();

        // mensagem de log
        logs = logs + "; " + ' respostas obtidas, resultado = ' + data?.resultado;

        // pega a resposta em "forma de linhas" (vetor)
        lines = Array.isArray(data?.detalhes) ? data.detalhes : [];

        // mensagem de log
        logs = logs + "; " + ' linhas obtidas = ' + lines.length;

    }
    return (
        <>
            {/* mostra logs, se houver */}

            {logs && (
                <p className="text-green-600 font-medium">
                    {logs}
                </p>
            )}

            <ul
                className="mt-6 w-full divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-md"
            >
                {/* para cada linha (map) ... exibe um "li"*/}

                {lines.map((line: { id: number; nome: string; email: string; telefone: string; login: string }) => (
                    <li key={line.id}
                        className="px-6 py-4 text-lg text-gray-800 transition-colors hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                    >{line.id}. {line.nome}, {line.email}, {line.telefone}, {line.login}</li>
                ))}

            </ul>
        </>
    );
}