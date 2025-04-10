"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function PlaybookUploader() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Playbook uploaded",
      description: file ? `Successfully uploaded ${file.name}` : "No file selected",
    })
    setOpen(false)
    setFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Playbook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Ansible Playbook</DialogTitle>
            <DialogDescription>Upload a YAML file containing your Ansible playbook</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Playbook Name</Label>
              <Input id="name" placeholder="Enter a name for this playbook" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe what this playbook does" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file">Playbook File (YAML)</Label>
              <Input id="file" type="file" accept=".yml,.yaml" onChange={handleFileChange} required />
              {file && (
                <p className="text-xs text-muted-foreground">
                  Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Upload Playbook</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
