import dynamic from "next/dynamic";

const TerminalClient = dynamic(() => import("../../components/terminal-client"), { ssr: false });

export default function TerminalPage() {
  return <TerminalClient />;
}