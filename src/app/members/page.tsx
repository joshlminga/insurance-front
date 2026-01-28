import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { StatsCard, StatsGrid } from "@/components/shared/stats-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Clock,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { members } from "@/data/dummy-data"
import { formatCurrency, formatDate, getInitials, formatPhone } from "@/lib/format"
import type { Policyholder as Member } from "@/types/insurance"

export default function PolicyholdersPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")

  // Filter members based on tab
  const filteredMembers = members.filter((member) => {
    if (activeTab === "all") return true
    if (activeTab === "active") return member.status === "active"
    if (activeTab === "pending") return member.status === "pending"
    if (activeTab === "suspended") return member.status === "suspended"
    return true
  })

  // Stats
  const totalMembers = members.length
  const activeMembers = members.filter((m) => m.status === "active").length
  const pendingMembers = members.filter((m) => m.status === "pending").length
  const suspendedMembers = members.filter((m) => m.status === "suspended").length

  const columns: Column<Member>[] = [
    {
      key: "member",
      label: "Policyholder",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(`${row.firstName} ${row.lastName}`)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-muted-foreground">{row.memberId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (_, row) => (
        <div>
          <p className="text-sm">{row.email}</p>
          <p className="text-xs text-muted-foreground">{formatPhone(row.phone)}</p>
        </div>
      ),
    },
    {
      key: "totalSavings",
      label: "Total Premiums",
      sortable: true,
      render: (value) => (
        <span className="font-medium">{formatCurrency(value as number)}</span>
      ),
    },
    {
      key: "activeLoans",
      label: "Active Policies",
      sortable: true,
    },
    {
      key: "joinDate",
      label: "Registered On",
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: "status",
      label: "Account Status",
      render: (value) => <StatusBadge status={value as string} />,
    },
  ]

  const actions = (row: Member) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/members/${row.memberId}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit Policyholder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {row.status === "active" ? (
          <DropdownMenuItem className="text-destructive">
            <Ban className="mr-2 h-4 w-4" />
            Suspend Account
          </DropdownMenuItem>
        ) : row.status === "suspended" ? (
          <DropdownMenuItem>
            <UserCheck className="mr-2 h-4 w-4" />
            Reactivate Account
          </DropdownMenuItem>
        ) : row.status === "pending" ? (
          <DropdownMenuItem>
            <UserCheck className="mr-2 h-4 w-4" />
            Approve Registration
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <PageHeader
        title="Policyholders"
        description="Manage insurance platform policyholders and registrations"
        actions={[
          {
            label: "Add Policyholder",
            icon: UserPlus,
            href: "/members/new",
          },
        ]}
      />

      <StatsGrid columns={4}>
        <StatsCard
          title="Total Policyholders"
          value={totalMembers}
          icon={Users}
        />
        <StatsCard
          title="Active Accounts"
          value={activeMembers}
          icon={UserCheck}
        />
        <StatsCard
          title="Pending Approval"
          value={pendingMembers}
          icon={Clock}
        />
        <StatsCard
          title="Suspended"
          value={suspendedMembers}
          icon={UserX}
        />
      </StatsGrid>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Policyholders ({totalMembers})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeMembers})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingMembers})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspendedMembers})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <DataTable
            data={filteredMembers}
            columns={columns}
            searchPlaceholder="Search policyholders..."
            searchKeys={["firstName", "lastName", "memberId", "email", "phone"]}
            onRowClick={(row) => navigate(`/members/${row.memberId}`)}
            actions={actions}
          />
        </TabsContent>
      </Tabs>
    </>
  )
}
