"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Log {
  id: number
  template_id: number
  server_name: string
  log_content: string
  timestamp: string 
  status: "success" | "failed" 
}

interface ExecutionTableProps {
  logs: Log[];
}

export function ExecutionTable({ logs }: ExecutionTableProps) {
  const [templateNames, setTemplateNames] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // Fetch template names for each unique template_id
    const uniqueTemplateIds = Array.from(new Set(logs.map(log => log.template_id)));
    uniqueTemplateIds.forEach((templateId) => {
      if (!templateNames[templateId]) {
        fetch(`http://localhost:8000/templates/getTemplate/${templateId}`)
          .then((res) => res.json())
          .then((template) => {
            setTemplateNames((prev) => ({
              ...prev,
              [templateId]: template.name,
            }));
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template</TableHead>
            <TableHead>Server</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{templateNames[log.template_id]}</TableCell>
              <TableCell>{log.server_name}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
              <TableCell>{log.log_content}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}