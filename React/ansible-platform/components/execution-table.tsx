"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


export function ExecutionTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templateNames, setTemplateNames] = useState({}); // Store template names by ID



  useEffect(() => {
    fetch("http://localhost:8000/logs/getLogs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);

        // Fetch template names for each log
        data.forEach((log) => {
          if (!templateNames[log.template_id]) {
            fetch(`http://localhost:8000/templates/getTemplate/${log.template_id}`)
              .then((res) => res.json())
              .then((template) => {
                setTemplateNames((prev) => ({
                  ...prev,
                  [log.template_id]: template.name,
                }));
              });
          }
        });
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template</TableHead>
            <TableHead>Server</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{templateNames[log.template_id]  }</TableCell>
              <TableCell>{log.server_name}</TableCell>
              <TableCell>{log.status}</TableCell>
              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}