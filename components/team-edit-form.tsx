"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription as FieldDesc,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { TeamMember } from "@/app/Types";

type ImageMode = "url" | "upload";

export function TeamEditForm({ 
  member, 
  isNew = false 
}: { 
  member: TeamMember; 
  isNew?: boolean;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<TeamMember>({ ...member });
  const [isSaving, setIsSaving] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>("url");
  const [previewUrl, setPreviewUrl] = useState(member.imageUrl);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "imageUrl") setPreviewUrl(value);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setFormData((prev) => ({ ...prev, imageUrl: objectUrl }));
    }
  }

  function handleSwitchMode(mode: ImageMode) {
    setImageMode(mode);
    if (mode === "url") {
      setPreviewUrl(
        formData.imageUrl.startsWith("blob:") ? member.imageUrl : formData.imageUrl
      );
      setFormData((prev) => ({
        ...prev,
        imageUrl: prev.imageUrl.startsWith("blob:") ? member.imageUrl : prev.imageUrl,
      }));
      setFileName("");
      setFile(null);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    const finalData = { ...formData };

    try {
      if (imageMode === "upload" && file) {
        toast.info("Uploading profile image to Cloudinary...");
        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!res.ok) throw new Error("Failed to upload image");

        const data = await res.json();
        finalData.imageUrl = data.secure_url;
      }

      toast.info(isNew ? "Adding team member..." : "Saving team member details...");
      const res = await fetch("/api/team", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) throw new Error("Failed to save team member");

      toast.success(isNew ? "Team member added successfully!" : "Team member saved successfully!");
      router.push("/team");
      router.refresh();

    } catch (error) {
      const err = error as Error;
      console.error(err);
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="relative">
          <img
            src={previewUrl}
            alt={formData.name}
            className="aspect-[3/2] w-full object-cover brightness-90 dark:brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge variant="secondary" className="mb-2">
              {formData.role || (isNew ? "New Role" : "")}
            </Badge>
            <h2 className="text-xl font-bold text-white drop-shadow-md">
              {formData.name || (isNew ? "New Member" : "")}
            </h2>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Add Team Member" : "Edit Team Member"}</CardTitle>
          <CardDescription>
            {isNew ? "Create a new team member profile." : "Modify the team member details below."}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input id="name" name="name" value={formData.name ?? ""} onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Input id="role" name="role" value={formData.role ?? ""} onChange={handleChange} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" name="email" type="email" value={formData.email ?? ""} onChange={handleChange} />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input id="phone" name="phone" value={formData.phone ?? ""} onChange={handleChange} />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea id="bio" name="bio" value={formData.bio ?? ""} onChange={handleChange} rows={3} />
            </Field>

            <Field>
              <FieldLabel>Profile Image</FieldLabel>
              <div className="flex gap-1 rounded-lg border border-input p-1">
                <button type="button" onClick={() => handleSwitchMode("url")} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  URL
                </button>
                <button type="button" onClick={() => handleSwitchMode("upload")} className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${imageMode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  File Upload
                </button>
              </div>
              {imageMode === "url" ? (
                <div className="mt-2">
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl ?? ""} onChange={handleChange} placeholder="/team/photo.jpg" />
                  <FieldDesc>Enter a URL or path to the profile image.</FieldDesc>
                </div>
              ) : (
                <div className="mt-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center transition-colors hover:border-ring hover:bg-muted/50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                    <p className="text-sm text-muted-foreground">{fileName || "Click to choose an image file"}</p>
                  </div>
                </div>
              )}
            </Field>
          </FieldGroup>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : (isNew ? "Create Member" : "Save Changes")}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/team")}>
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
