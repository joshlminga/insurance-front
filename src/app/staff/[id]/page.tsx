import { useParams } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { DetailItem, DetailGrid } from "@/components/shared/detail-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Ban, UserCheck, Mail, Phone, Building, Shield } from "lucide-react"
import { staff } from "@/data/dummy-data"
import { formatDate, formatRelativeTime, getInitials } from "@/lib/format"
import { EmptyState } from "@/components/shared/empty-state"

const roleLabels: Record<string, string> = {
  admin: "Platform Admin",
  manager: "Operations Manager",
  underwriter: "Insurance Underwriter",
  accountant: "Finance Officer",
  agent: "Claims Officer",
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const staffMember = staff.find((s) => s.staffId === id)

  if (!staffMember) {
    return (
      <EmptyState
        title="Agent Not Found"
        description="The agent you're looking for doesn't exist."
        action={{ label: "Back to Agents", href: "/staff" }}
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Agent Profile"
        description={`${staffMember.firstName} ${staffMember.lastName}`}
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/staff",
          },
          {
            label: "Edit Details",
            icon: Edit,
            variant: "outline",
            onClick: () => {},
          },
          staffMember.isActive
            ? {
                label: "Disable Access",
                icon: Ban,
                variant: "outline",
                onClick: () => {},
              }
            : {
                label: "Enable Access",
                icon: UserCheck,
                onClick: () => {},
              },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agent Profile */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(`${staffMember.firstName} ${staffMember.lastName}`)}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">
                {staffMember.firstName} {staffMember.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{staffMember.staffId}</p>
              <Badge className="mt-2" variant={staffMember.isActive ? "success" : "secondary"}>
                {staffMember.isActive ? "Active" : "Disabled"}
              </Badge>

              <div className="mt-6 w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{staffMember.branch} Region</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>{roleLabels[staffMember.role] || staffMember.role}</span>
                </div>
              </div>

              <div className="mt-6 w-full border-t pt-6">
                <p className="text-sm text-muted-foreground">Last Activity</p>
                <p className="font-medium">
                  {staffMember.lastLogin
                    ? formatRelativeTime(staffMember.lastLogin)
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailGrid columns={2}>
                <DetailItem label="Staff ID" value={staffMember.staffId} />
                <DetailItem label="Department" value={staffMember.department.replace("Loans", "Underwriting").replace("Operations", "Customer Success")} />
                <DetailItem label="Designation" value={roleLabels[staffMember.role] || staffMember.role} />
                <DetailItem label="Assigned Region" value={staffMember.branch} />
                <DetailItem label="Joined On" value={formatDate(staffMember.createdAt)} />
                <DetailItem label="Profile Updated" value={formatDate(staffMember.updatedAt)} />
              </DetailGrid>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {staffMember.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline">
                    {permission === "all" ? "Full Admin Access" : permission}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="No Recent Activity"
                description="Agent activity log will appear here once actions are performed."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
