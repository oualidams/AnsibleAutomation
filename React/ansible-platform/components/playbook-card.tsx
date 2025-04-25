import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileCode } from "lucide-react";
import { ExecutePlaybook } from "@/components/execute-playbook";

interface Playbook {
  id: number;
  name: string;
  description: string;
  configurations: any[]; // Array of configurations
}

export function PlaybookCard({ playbook }: { playbook: Playbook }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{playbook.name}</CardTitle>
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {playbook.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileCode className="h-3.5 w-3.5" />
            <span>
              {playbook.configurations?.length || 0} configurations
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <ExecutePlaybook playbook={playbook} />
      </CardFooter>
    </Card>
  );
}