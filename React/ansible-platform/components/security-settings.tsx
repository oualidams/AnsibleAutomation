"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ShieldCheck, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SecuritySettings() {
  const [settings, setSettings] = useState({
    sshKeyAuth: true,
    passwordAuth: false,
    mfa: true,
    sessionTimeout: "30",
    passwordPolicy: {
      minLength: "12",
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true,
      expiryDays: "90",
    },
    ipRestriction: false,
    allowedIPs: "192.168.1.0/24\n10.0.0.0/8",
    auditLogging: true,
    sshKeyPath: "/etc/ansible/keys",
    vaultEncryption: true,
    vaultPasswordFile: "/etc/ansible/vault_password",
  })
  const { toast } = useToast()

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Security settings have been updated successfully",
    })
  }

  const handleResetSettings = () => {
    // In a real app, this would reset to default values from the server
    toast({
      title: "Settings reset",
      description: "Security settings have been reset to defaults",
    })
  }

  const handleChange = (section, field, value) => {
    if (section) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [field]: value,
        },
      })
    } else {
      setSettings({
        ...settings,
        [field]: value,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>Configure security settings for your Ansible automation platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="authentication" className="space-y-4">
          <TabsList>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="passwords">Password Policy</TabsTrigger>
            <TabsTrigger value="network">Network Security</TabsTrigger>
            <TabsTrigger value="encryption">Encryption</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">SSH Key Authentication</Label>
                  <p className="text-sm text-muted-foreground">Use SSH keys for authenticating to remote servers</p>
                </div>
                <Switch
                  checked={settings.sshKeyAuth}
                  onCheckedChange={(checked) => handleChange(null, "sshKeyAuth", checked)}
                />
              </div>

              {settings.sshKeyAuth && (
                <div className="grid gap-2 ml-6">
                  <Label htmlFor="ssh-key-path">SSH Key Path</Label>
                  <Input
                    id="ssh-key-path"
                    value={settings.sshKeyPath}
                    onChange={(e) => handleChange(null, "sshKeyPath", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Directory where SSH keys are stored</p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Password Authentication</Label>
                  <p className="text-sm text-muted-foreground">Allow password authentication for servers</p>
                </div>
                <Switch
                  checked={settings.passwordAuth}
                  onCheckedChange={(checked) => handleChange(null, "passwordAuth", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require MFA for platform users</p>
                </div>
                <Switch checked={settings.mfa} onCheckedChange={(checked) => handleChange(null, "mfa", checked)} />
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange(null, "sessionTimeout", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Automatically log out inactive users after this period</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="passwords" className="space-y-4">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="min-length">Minimum Password Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => handleChange("passwordPolicy", "minLength", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-uppercase">Require Uppercase Letters</Label>
                <Switch
                  id="require-uppercase"
                  checked={settings.passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => handleChange("passwordPolicy", "requireUppercase", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-lowercase">Require Lowercase Letters</Label>
                <Switch
                  id="require-lowercase"
                  checked={settings.passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => handleChange("passwordPolicy", "requireLowercase", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-numbers">Require Numbers</Label>
                <Switch
                  id="require-numbers"
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => handleChange("passwordPolicy", "requireNumbers", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-special">Require Special Characters</Label>
                <Switch
                  id="require-special"
                  checked={settings.passwordPolicy.requireSpecial}
                  onCheckedChange={(checked) => handleChange("passwordPolicy", "requireSpecial", checked)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiry-days">Password Expiry (days)</Label>
                <Input
                  id="expiry-days"
                  type="number"
                  value={settings.passwordPolicy.expiryDays}
                  onChange={(e) => handleChange("passwordPolicy", "expiryDays", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days before passwords expire and must be changed
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">IP Address Restriction</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses or ranges</p>
                </div>
                <Switch
                  checked={settings.ipRestriction}
                  onCheckedChange={(checked) => handleChange(null, "ipRestriction", checked)}
                />
              </div>

              {settings.ipRestriction && (
                <div className="grid gap-2">
                  <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                  <Textarea
                    id="allowed-ips"
                    value={settings.allowedIPs}
                    onChange={(e) => handleChange(null, "allowedIPs", e.target.value)}
                    placeholder="Enter IP addresses or CIDR ranges, one per line"
                    className="h-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter IP addresses or CIDR ranges, one per line (e.g., 192.168.1.0/24)
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Log all security-related events</p>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => handleChange(null, "auditLogging", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="encryption" className="space-y-4">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Ansible Vault Encryption</Label>
                  <p className="text-sm text-muted-foreground">Use Ansible Vault to encrypt sensitive data</p>
                </div>
                <Switch
                  checked={settings.vaultEncryption}
                  onCheckedChange={(checked) => handleChange(null, "vaultEncryption", checked)}
                />
              </div>

              {settings.vaultEncryption && (
                <div className="grid gap-2 ml-6">
                  <Label htmlFor="vault-password-file">Vault Password File</Label>
                  <Input
                    id="vault-password-file"
                    value={settings.vaultPasswordFile}
                    onChange={(e) => handleChange(null, "vaultPasswordFile", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Path to the file containing the Ansible Vault password
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleResetSettings} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Save Security Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
