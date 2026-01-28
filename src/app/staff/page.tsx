import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormField, SelectField, FormGrid } from "@/components/shared/form-field"
import {
  Users,
  UserPlus,
  Shield,
  Building,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  UserCheck,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { staff, branches } from "@/data/dummy-data"
import { formatRelativeTime, getInitials } from "@/lib/format"
import type { Staff } from "@/types/insurance"

const roleLabels: Record<string, string> = {
  admin: "Platform Admin",
  manager: "Operations Manager",
  loan_officer: "Insurance Underwriter",
  accountant: "Finance Officer",
  teller: "Claims Officer",
}

const roleBadgeVariants: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  manager: "default",
  loan_officer: "secondary",
  accountant: "secondary",
  teller: "outline",
}

export default function AgentsPage() {
  const navigate = useNavigate()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Stats
  const totalStaff = staff.length
  const activeStaff = staff.filter((s) => s.isActive).length
  const roleCount = staff.reduce((acc, s) => {
    acc[s.role] = (acc[s.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const columns: Column<Staff>[] = [
    {
      key: "staff",
      label: "Full Name",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(`${row.firstName} ${row.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{row.staffId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (_, row) => (
        <div>
          <p className="text-sm">{row.email}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Position",
      render: (value) => (
        <Badge variant={roleBadgeVariants[value as string] || "secondary"}>
          {roleLabels[value as string] || (value as string)}
        </Badge>
      ),
    },
    {
      key: "department",
      label: "Team/Dept",
      render: (value) => (value as string).replace("Loans", "Underwriting").replace("Operations", "Customer Success"),
    },
    {
      key: "branch",
      label: "Region",
    },
    {
      key: "lastLogin",
      label: "Last Activity",
      render: (value) => (value ? formatRelativeTime(value as string) : "Never"),
    },
    {
      key: "isActive",
      label: "Account",
      render: (value) =>
        value ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="secondary">Disabled</Badge>
        ),
    },
  ]

  const actions = (row: Staff) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/staff/${row.staffId}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Manage User
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {row.isActive ? (
          <DropdownMenuItem className="text-destructive">
            <Ban className="mr-2 h-4 w-4" />
            Disable Access
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <UserCheck className="mr-2 h-4 w-4" />
            Enable Access
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <PageHeader
        title="Agents & Platform Team"
        description="Manage insurance agents, underwriters and administrative staff"
        actions={[
          {
            label: "Invite Agent",
            icon: UserPlus,
            onClick: () => setIsAddModalOpen(true),
          },
        ]}
      />

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Team"
          value={totalStaff}
          description={`${activeStaff} active`}
          icon={Users}
        />
        <StatsCard
          title="Underwriters"
          value={roleCount.loan_officer || 0}
          icon={Shield}
        />
        <StatsCard
          title="Claim Officers"
          value={roleCount.teller || 0}
          icon={Shield}
        />
        <StatsCard
          title="Partner Offices"
          value={branches.length}
          icon={Building}
        />
      </StatsGrid>

      <DataTable
        data={staff}
        columns={columns}
        searchPlaceholder="Search agents by name, ID or email..."
        searchKeys={["firstName", "lastName", "staffId", "email"]}
        onRowClick={(row) => navigate(`/staff/${row.staffId}`)}
        actions={actions}
      />

      {/* Add Agent Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Invite New Agent/Staff</DialogTitle>
            <DialogDescription>
              Grant platform access to a new team member
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setIsAddModalOpen(false)
            }}
          >
            <div className="space-y-4 py-4">
              <FormGrid columns={2}>
                <FormField
                  label="First Name"
                  name="firstName"
                  required
                  placeholder="Enter first name"
                />
                <FormField
                  label="Last Name"
                  name="lastName"
                  required
                  placeholder="Enter last name"
                />
                <FormField
                  label="Work Email"
                  name="email"
                  type="email"
                  required
                  placeholder="email@accensure.com"
                />
                <FormField
                  label="Mobile Number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+254..."
                />
                <SelectField
                  label="Designation/Role"
                  name="role"
                  required
                  options={[
                    { label: "Administrator", value: "admin" },
                    { label: "Manager", value: "manager" },
                    { label: "Underwriter", value: "loan_officer" },
                    { label: "Accountant", value: "accountant" },
                    { label: "Claims Officer", value: "teller" },
                  ]}
                  placeholder="Select designation"
                />
                <SelectField
                  label="Primary Department"
                  name="department"
                  required
                  options={[
                    { label: "Administration", value: "Administration" },
                    { label: "Customer Success", value: "Operations" },
                    { label: "Underwriting", value: "Loans" },
                    { label: "Finance", value: "Finance" },
                  ]}
                  placeholder="Select department"
                />
                <SelectField
                  label="Assigned Region"
                  name="branch"
                  required
                  options={branches.map((b) => ({
                    label: b.name,
                    value: b.name,
                  }))}
                  placeholder="Select region"
                  className="md:col-span-2"
                />
              </FormGrid>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
