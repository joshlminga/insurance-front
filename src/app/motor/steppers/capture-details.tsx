import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const CaptureDetails = () => {
  return (
    <div className="flex flex-col gap-8 max-w-full mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img src='/car.png' />
        </div>

        <div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Enter first name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Enter last name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="Enter email address" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="Enter phone number" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="idNumber">ID/Passport Number</Label>
            <Input id="idNumber" placeholder="Enter ID or Passport number" />
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Account Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button className="bg-[#C20C0C] hover:bg-[#A10A0A] text-white px-8">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
