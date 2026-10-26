import type { Metadata } from "next";
import "./globals.css";

// importando o componente Menu
import Menu from "./components/Menu";

export const metadata: Metadata = {
  title: "Cadastro de Pessoas e Brawlers",
  description: "Sistema de cadastro de pessoas e brawlers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="pt-BR"
      className={"h-full antialiased"}
    >

      <body className="min-h-full flex flex-col">
        
        {/* o componente menu será 
        usado em todas as páginas */}
        <Menu />

        {children}

      </body>
    </html>
  );
}