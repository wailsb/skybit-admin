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
  FieldDescription,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ServiceData {
  id: string;
  title: string;
  description: string;
  ImageUrl: string;
  linkto: string;
}

type ImageMode = "url" | "upload";

export function ServiceEditForm({ 
  service, 
  isNew = false 
}: { 
  service: ServiceData, 
  isNew?: boolean 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<ServiceData>({ ...service });
  const [isSaving, setIsSaving] = useState(false);
  const [imageMode, setImageMode] = useState<ImageMode>("url");
  const [previewUrl, setPreviewUrl] = useState<string>(service.ImageUrl);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "ImageUrl") {
      setPreviewUrl(value);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setFormData((prev) => ({ ...prev, ImageUrl: objectUrl }));
    }
  }

  function handleSwitchMode(mode: ImageMode) {
    setImageMode(mode);
    if (mode === "url") {
      setPreviewUrl(formData.ImageUrl.startsWith("blob:") ? service.ImageUrl : formData.ImageUrl);
      setFormData((prev) => ({
        ...prev,
        ImageUrl: prev.ImageUrl.startsWith("blob:") ? service.ImageUrl : prev.ImageUrl,
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
        toast.info("Uploading image to Cloudinary...");
        const uploadData = new FormData();
        uploadData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!res.ok) throw new Error("Failed to upload image");

        const data = await res.json();
        finalData.ImageUrl = data.secure_url;
      }

      toast.info(isNew ? "Creating service..." : "Saving service details...");
      const res = await fetch("/api/services", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) throw new Error("Failed to save service");

      toast.success(isNew ? "Service created successfully!" : "Service saved successfully!");
      router.push("/services");
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
      {/* Image Preview */}
      <Card className="overflow-hidden p-0">
        <div className="relative">
          <img
            src={previewUrl}
            alt={formData.title}
            className="aspect-video w-full object-cover brightness-90 dark:brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {!isNew && (
              <Badge variant="secondary" className="mb-2">
                ID: {formData.id}
              </Badge>
            )}
            <h2 className="text-xl font-bold text-white drop-shadow-md">
              {formData.title || "New Service"}
            </h2>
          </div>
        </div>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isNew ? "Add New Service" : "Edit Service"}</CardTitle>
          <CardDescription>
            {isNew 
              ? "Fill in the details below to define a new service." 
              : "Modify the service details below and save your changes."}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Service title"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Service description"
                rows={4}
              />
            </Field>

            {/* Image Source Toggle */}
            <Field>
              <FieldLabel>Service Image</FieldLabel>
              <div className="flex gap-1 rounded-lg border border-input p-1">
                <button
                  type="button"
                  onClick={() => handleSwitchMode("url")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    imageMode === "url"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("upload")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    imageMode === "upload"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  File Upload
                </button>
              </div>

              {imageMode === "url" ? (
                <div className="mt-2">
                  <Input
                    id="ImageUrl"
                    name="ImageUrl"
                    value={formData.ImageUrl}
                    onChange={handleChange}
                    placeholder="/image.jpg"
                  />
                  <FieldDescription>
                    Enter a URL or path to the service image.
                  </FieldDescription>
                </div>
              ) : (
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="imageUpload"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input px-4 py-6 text-center transition-colors hover:border-ring hover:bg-muted/50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-8 text-muted-foreground"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                    {fileName ? (
                      <p className="text-sm font-medium text-foreground">
                        {fileName}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to choose an image file
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="linkto">Link Path</FieldLabel>
              <Input
                id="linkto"
                name="linkto"
                value={formData.linkto}
                onChange={handleChange}
                placeholder="/service-path"
              />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : (isNew ? "Create Service" : "Save Changes")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/services")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

