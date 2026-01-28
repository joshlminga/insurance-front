import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField, FormGrid } from "@/components/shared/form-field"
import {
  Building,
  CreditCard,
  Bell,
  Shield,
  Database,
  Save,
  Upload,
} from "lucide-react"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Configure Accensure system settings and preferences"
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Building className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="financial">
            <CreditCard className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Database className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accensure Profile</CardTitle>
              <CardDescription>
                Basic information about your Accensure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Upload Logo
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    PNG, JPG up to 2MB. Recommended: 200x200px
                  </p>
                </div>
              </div>

              <FormGrid columns={2}>
                <FormField
                  label="Accensure Name"
                  name="name"
                  defaultValue="Accensure Manager"
                  placeholder="Enter Accensure name"
                />
                <FormField
                  label="Registration Number"
                  name="regNumber"
                  defaultValue="CS/12345/2020"
                  placeholder="Enter registration number"
                />
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  defaultValue="info@Accensure.com"
                  placeholder="Enter email"
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  defaultValue="+254700000000"
                  placeholder="Enter phone"
                />
                <FormField
                  label="Address"
                  name="address"
                  defaultValue="123 Kenyatta Avenue"
                  placeholder="Enter address"
                  className="md:col-span-2"
                />
                <FormField
                  label="Website"
                  name="website"
                  defaultValue="https://Accensure.com"
                  placeholder="Enter website URL"
                />
              </FormGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure currency, timezone, and locale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid columns={3}>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select defaultValue="KES">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                      <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select defaultValue="Africa/Nairobi">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                      <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fiscal Year Start</Label>
                  <Select defaultValue="january">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="january">January</SelectItem>
                      <SelectItem value="april">April</SelectItem>
                      <SelectItem value="july">July</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </FormGrid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interest Settings</CardTitle>
              <CardDescription>
                Configure interest computation and posting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid columns={2}>
                <div className="space-y-2">
                  <Label>Interest Computation Day</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Day {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Interest Posting Day</Label>
                  <Select defaultValue="1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Day {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Settings</CardTitle>
              <CardDescription>
                Default loan processing configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid columns={2}>
                <FormField
                  label="Maximum Loan Multiplier"
                  name="loanMultiplier"
                  type="number"
                  defaultValue="3"
                  description="Maximum loan amount as multiple of savings"
                />
                <FormField
                  label="Default Grace Period (days)"
                  name="gracePeriod"
                  type="number"
                  defaultValue="14"
                />
                <FormField
                  label="Default Penalty Rate (%)"
                  name="penaltyRate"
                  type="number"
                  defaultValue="5"
                  step={0.1}
                />
                <FormField
                  label="Auto-Default After (days)"
                  name="autoDefault"
                  type="number"
                  defaultValue="90"
                  description="Days overdue before marking as defaulted"
                />
              </FormGrid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send SMS alerts to members
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Send email alerts to members
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    In-app push notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Events</CardTitle>
              <CardDescription>
                Choose which events trigger notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Loan Approval</p>
                  <p className="text-sm text-muted-foreground">
                    Notify member when loan is approved
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Loan Disbursement</p>
                  <p className="text-sm text-muted-foreground">
                    Notify member when loan is disbursed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Send reminders before payment due dates
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transaction Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notify for deposits and withdrawals
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Configure password requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormGrid columns={2}>
                <FormField
                  label="Minimum Password Length"
                  name="minPasswordLength"
                  type="number"
                  defaultValue="8"
                />
                <FormField
                  label="Password Expiry (days)"
                  name="passwordExpiry"
                  type="number"
                  defaultValue="90"
                />
              </FormGrid>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Require Special Characters</p>
                  <p className="text-sm text-muted-foreground">
                    Passwords must contain special characters
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all staff
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
              <CardDescription>
                Configure session timeout and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormGrid columns={2}>
                <FormField
                  label="Session Timeout (minutes)"
                  name="sessionTimeout"
                  type="number"
                  defaultValue="30"
                />
                <FormField
                  label="Max Login Attempts"
                  name="maxLoginAttempts"
                  type="number"
                  defaultValue="5"
                />
              </FormGrid>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>M-Pesa Integration</CardTitle>
              <CardDescription>
                Configure M-Pesa payment gateway
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable M-Pesa</p>
                  <p className="text-sm text-muted-foreground">
                    Accept M-Pesa payments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <FormGrid columns={2}>
                <FormField
                  label="Consumer Key"
                  name="mpesaConsumerKey"
                  type="password"
                  placeholder="Enter consumer key"
                />
                <FormField
                  label="Consumer Secret"
                  name="mpesaConsumerSecret"
                  type="password"
                  placeholder="Enter consumer secret"
                />
                <FormField
                  label="Shortcode"
                  name="mpesaShortcode"
                  placeholder="Enter shortcode"
                />
                <FormField
                  label="Passkey"
                  name="mpesaPasskey"
                  type="password"
                  placeholder="Enter passkey"
                />
              </FormGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Gateway</CardTitle>
              <CardDescription>
                Configure SMS provider settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable SMS</p>
                  <p className="text-sm text-muted-foreground">
                    Send SMS notifications
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <FormGrid columns={2}>
                <div className="space-y-2">
                  <Label>SMS Provider</Label>
                  <Select defaultValue="africastalking">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="africastalking">Africa's Talking</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <FormField
                  label="API Key"
                  name="smsApiKey"
                  type="password"
                  placeholder="Enter API key"
                />
              </FormGrid>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </>
  )
}
