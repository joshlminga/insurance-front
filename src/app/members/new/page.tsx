import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/shared/page-header"
import { FormField, SelectField, FormGrid } from "@/components/shared/form-field"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, ArrowLeft, Upload } from "lucide-react"

interface MemberFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  idNumber: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  branch: string
  initialDeposit: string
  shareCapital: string
}

const initialFormData: MemberFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  idNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  city: "",
  branch: "",
  initialDeposit: "",
  shareCapital: "",
}

export default function MemberNewPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<MemberFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<MemberFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof MemberFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof MemberFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<MemberFormData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.idNumber.trim()) newErrors.idNumber = "ID number is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.branch) newErrors.branch = "Branch is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    navigate("/members")
  }

  return (
    <>
      <PageHeader
        title="Register New Member"
        description="Add a new member to the Accensure"
        actions={[
          {
            label: "Back",
            icon: ArrowLeft,
            variant: "outline",
            href: "/members",
          },
        ]}
      />

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="contact">Contact & Address</TabsTrigger>
            <TabsTrigger value="account">Account Setup</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Enter the member's personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormGrid columns={2}>
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    required
                    placeholder="Enter first name"
                  />
                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    required
                    placeholder="Enter last name"
                  />
                  <FormField
                    label="ID Number"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    error={errors.idNumber}
                    required
                    placeholder="Enter national ID number"
                  />
                  <FormField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    error={errors.dateOfBirth}
                    required
                  />
                  <SelectField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleSelectChange("gender")}
                    error={errors.gender}
                    required
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" },
                      { label: "Other", value: "other" },
                    ]}
                    placeholder="Select gender"
                  />
                </FormGrid>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact & Address</CardTitle>
                <CardDescription>
                  Enter contact information and address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormGrid columns={2}>
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                    placeholder="email@example.com"
                  />
                  <FormField
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    required
                    placeholder="+254712345678"
                  />
                  <FormField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    placeholder="Street address"
                    className="md:col-span-2"
                  />
                  <FormField
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    error={errors.city}
                    placeholder="City"
                  />
                </FormGrid>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Setup</CardTitle>
                <CardDescription>
                  Configure the member's initial account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormGrid columns={2}>
                  <SelectField
                    label="Branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleSelectChange("branch")}
                    error={errors.branch}
                    required
                    options={[
                      { label: "Main Branch", value: "main" },
                      { label: "Nakuru Branch", value: "nakuru" },
                      { label: "Kisumu Branch", value: "kisumu" },
                      { label: "Mombasa Branch", value: "mombasa" },
                      { label: "Eldoret Branch", value: "eldoret" },
                    ]}
                    placeholder="Select branch"
                  />
                  <FormField
                    label="Initial Deposit"
                    name="initialDeposit"
                    type="number"
                    value={formData.initialDeposit}
                    onChange={handleInputChange}
                    placeholder="0"
                    description="Minimum deposit: KES 500"
                    min={0}
                  />
                  <FormField
                    label="Share Capital"
                    name="shareCapital"
                    type="number"
                    value={formData.shareCapital}
                    onChange={handleInputChange}
                    placeholder="0"
                    description="Minimum shares: KES 5,000"
                    min={0}
                  />
                </FormGrid>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>KYC Documents</CardTitle>
                <CardDescription>
                  Upload required documents for KYC verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">National ID (Front)</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Upload
                    </Button>
                  </div>
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">National ID (Back)</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Upload
                    </Button>
                  </div>
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Passport Photo</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Upload
                    </Button>
                  </div>
                  <div className="rounded-lg border-2 border-dashed p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">Proof of Address</p>
                    <p className="text-xs text-muted-foreground">
                      Utility bill or bank statement
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Upload
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/members")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Register Member"}
          </Button>
        </div>
      </form>
    </>
  )
}
