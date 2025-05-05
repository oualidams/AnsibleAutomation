import { useEffect, useState } from "react";
import { PlaybookCard } from "./playbook-card";

interface Playbook {
  id: number;
  name: string;
  description: string;
  configurations: any[]; // Array of configurations
}

export function PlaybookList() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

  useEffect(() => {
    async function fetchTemplates() {
      const response = await fetch("http://localhost:8000/getTemplates");
      const data = await response.json();
      setPlaybooks(data);
    }
    fetchTemplates();
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((playbook) => (
        <PlaybookCard key={playbook.id} playbook={playbook} />
      ))}
    </div>
  );
}