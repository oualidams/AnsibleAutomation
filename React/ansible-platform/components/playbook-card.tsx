import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileCode, Clock } from "lucide-react";
import { ExecutePlaybook } from "@/components/execute-playbook";

interface Playbook {
  name: string;
  description: string;
  tasks: number;
  lastRun?: string;
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
            <span>{playbook.tasks} tasks</span>
          </div>
          {playbook.lastRun && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{playbook.lastRun}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <ExecutePlaybook playbook={playbook} />
      </CardFooter>
    </Card>
  );
}
