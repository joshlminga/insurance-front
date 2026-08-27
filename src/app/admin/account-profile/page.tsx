/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { PageHeader } from "@/components/shared"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, ReuseableInput } from "@/dev/core"
import { UseApiMutation } from "@/hooks/hooks"
import { UseAuth } from "@/stores/auth-store"
import {
  AccountAvatarSchema,
  AccountGeneralSchema,
  UpdatePasswordSchema,
} from "@/types/form-schema"
import type {
  AccountAvatarFormValues,
  AccountGeneralFormValues,
  UpdatePasswordFormValues,
} from "@/types/schema"
import type { SubmitResponse } from "@/types/types"
import { ACCEPTED_IMAGE_TYPES, EMETHODS } from "@/utils/constatnts"
import { extractErrorMessage } from "@/utils/helpers"
import { ShowToast } from "@/utils/utils"
import { getInitials } from "@/lib/format"
import { CurrentPasswordField } from "./current-password-field"
import {
  resolveMediaUrl,
  resolveUserAvatarUrl,
  toProfilePasswordPayload,
} from "./profile-api"

type ProfilePasswordPayload = ReturnType<typeof toProfilePasswordPayload>

/**
 * Account Profile — three independent forms (like 3 separate Laravel Form Requests).
 * useForm ≈ keeping old() input + validation per segment.
 * UseAuth().user ≈ Auth::user() session data.
 * Wired to PATCH profile, PATCH profile/password, POST profile/picture.
 */
export function AccountProfilePage() {
  const { user, updateUser } = UseAuth()
  const avatarSrc = resolveUserAvatarUrl(user as any)

  // --- Segment 1: General info ---
  const generalForm = useForm<AccountGeneralFormValues>({
    resolver: zodResolver(AccountGeneralSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      current_password: "",
    },
  })

  // Prefill from session user when it loads / changes
  useEffect(() => {
    if (!user) return
    generalForm.reset({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      current_password: "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.email, user?.phone])

  const generalMutation = UseApiMutation<SubmitResponse, AccountGeneralFormValues>({
    url: "profile",
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data, variables) => {
        // Update sidebar name/email/phone immediately (like refreshing Auth::user())
        updateUser({
          name: variables.name,
          email: variables.email,
          phone: variables.phone || null,
        })
        generalForm.setValue("current_password", "")
        ShowToast.success(data?.message || "Profile updated successfully")
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || "Profile update failed")
      },
    },
  })

  // --- Segment 2: Password ---
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const passwordMutation = UseApiMutation<SubmitResponse, ProfilePasswordPayload>({
    url: "profile/password",
    method: EMETHODS.PATCH,
    mutationOptions: {
      onSuccess: (data) => {
        passwordForm.reset()
        ShowToast.success(data?.message || "Password updated successfully")
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || "Password update failed")
      },
    },
  })

  // --- Segment 3: Profile picture ---
  const avatarForm = useForm<AccountAvatarFormValues>({
    resolver: zodResolver(AccountAvatarSchema),
    defaultValues: {
      profile_picture: undefined,
      current_password: "",
    },
  })

  const avatarMutation = UseApiMutation<SubmitResponse, FormData>({
    url: "profile/picture",
    method: EMETHODS.POST,
    config: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: (data) => {
        const rawPath =
          (data?.data as any)?.avatar ??
          (data?.data as any)?.avatar_url ??
          (data?.data as any)?.profile_picture
        if (typeof rawPath === "string" && rawPath) {
          // Store absolute URL so sidebar Avatar can load it
          updateUser({ avatar: resolveMediaUrl(rawPath) })
        }
        avatarForm.reset({ profile_picture: undefined, current_password: "" })
        ShowToast.success(data?.message || "Profile picture updated successfully")
      },
      onError: (error: any) => {
        ShowToast.error(extractErrorMessage(error) || "Profile picture update failed")
      },
    },
  })

  const onSubmitAvatar = (data: AccountAvatarFormValues) => {
    const formData = new FormData()
    formData.append("current_password", data.current_password)
    if (data.profile_picture instanceof File) {
      formData.append("profile_picture", data.profile_picture)
    }
    avatarMutation.mutate(formData)
  }

  return (
    <>
      <PageHeader
        title="Account Profile"
        description="Update your personal information, password, and profile picture"
      />

      <div className="space-y-4">
        {/* Segment 1 — General: 3 fields per row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>General information</CardTitle>
            <CardDescription>
              Update your name, email, and phone. Current password is required to authorize changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={generalForm.handleSubmit((data) => generalMutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ReuseableInput
                  control={generalForm.control}
                  name="name"
                  label="Name"
                  required
                  placeholder="Your full name"
                  className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                  control={generalForm.control}
                  name="email"
                  type="email"
                  label="Email"
                  required
                  placeholder="you@example.com"
                  className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <ReuseableInput
                  control={generalForm.control}
                  name="phone"
                  type="tel"
                  label="Phone number"
                  placeholder="e.g. +254712345678"
                  className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <CurrentPasswordField
                  control={generalForm.control}
                  name="current_password"
                />
                <div className="flex items-end sm:col-span-2 lg:col-span-2">
                  <Button type="submit" loading={generalMutation.isPending}>
                    Update profile
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Segment 2 — Password: 3 fields per row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password. Current password is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={passwordForm.handleSubmit((data) =>
                passwordMutation.mutate(toProfilePasswordPayload(data))
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <CurrentPasswordField
                  control={passwordForm.control}
                  name="current_password"
                />
                <div className="relative">
                  <ReuseableInput
                    control={passwordForm.control}
                    name="new_password"
                    label="New Password"
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    autoComplete="new-password"
                    className="w-full h-10 rounded-[5px] border border-[#ADABAB] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <ReuseableInput
                    control={passwordForm.control}
                    name="confirm_password"
                    label="Confirm New Password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    required
                    autoComplete="new-password"
                    className="w-full h-10 rounded-[5px] border border-[#ADABAB] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" loading={passwordMutation.isPending}>
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Segment 3 — Profile picture: compact row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>
              Upload a jpeg, png, or webp photo. Current password is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={avatarForm.handleSubmit(onSubmitAvatar)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 items-end">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 shrink-0 rounded-full">
                    {avatarSrc && (
                      <AvatarImage src={avatarSrc} alt={user?.name ?? "Avatar"} />
                    )}
                    <AvatarFallback className="rounded-full text-primary text-sm">
                      {getInitials(user?.name ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Current photo. Choose a new file to replace it.
                  </p>
                </div>
                <ReuseableInput
                  control={avatarForm.control}
                  name="profile_picture"
                  type="file"
                  label="Profile picture"
                  required
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="w-full h-10 rounded-[5px] border border-[#ADABAB]"
                />
                <CurrentPasswordField
                  control={avatarForm.control}
                  name="current_password"
                />
              </div>
              <Button type="submit" loading={avatarMutation.isPending}>
                Update picture
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
