"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription as FieldDesc,
  FieldSeparator,
} from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { SocialLink, WebsiteMetadata } from "@/app/Types";

interface SettingsData {
  socialLinks: SocialLink[];
  metadata: WebsiteMetadata;
}

export function SettingsForm({ initialData }: { initialData: SettingsData }) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    initialData.socialLinks || []
  );
  const [metadata, setMetadata] = useState<WebsiteMetadata>(
    initialData.metadata || {} as WebsiteMetadata
  );
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(initialData.metadata?.logoUrl || "");
  const [logoFileName, setLogoFileName] = useState("");
  
  // Track actual files for upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [sceneFiles, setSceneFiles] = useState<File[]>([]);
  
  const logoFileRef = useRef<HTMLInputElement>(null);
  const sceneFileRef = useRef<HTMLInputElement>(null);

  // Social link handlers
  function addSocialLink() {
    const newId = String(Date.now());
    setSocialLinks((prev) => [
      ...prev,
      { id: newId, platform: "", url: "", iconName: "" },
    ]);
  }

  function updateSocialLink(id: string, field: keyof SocialLink, value: string) {
    setSocialLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  }

  function deleteSocialLink(id: string) {
    setSocialLinks((prev) => prev.filter((link) => link.id !== id));
  }

  // Metadata handlers
  function handleMetaChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoFileName(file.name);
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  }

  function handleSceneFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setSceneFiles(fileArray);
      const names = fileArray.map((f) => f.name);
      setMetadata((prev) => ({ ...prev, scene3dFiles: names })); // Temporary local display names
    }
  }

  async function handleSave() {
    setIsSaving(true);
    const updatedMetadata = { ...metadata };

    try {
      // 1. Upload Logo if changed
      if (logoFile) {
        toast.info("Uploading new logo...");
        const formData = new FormData();
        formData.append("file", logoFile);
        
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Failed to upload logo");
        
        const data = await res.json();
        updatedMetadata.logoUrl = data.secure_url;
      }

      // 2. Upload 3D Scene Files if changed (concurrently)
      if (sceneFiles.length > 0) {
        toast.info(`Uploading ${sceneFiles.length} 3D scene files...`);
        const uploadPromises = sceneFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
          const data = await res.json();
          // We could return an object Mapping names to URLs, but for now we store the secure URLs
          return data.secure_url;
        });

        const sceneUrls = await Promise.all(uploadPromises);
        updatedMetadata.scene3dFiles = sceneUrls;
      }

      // 3. Save to Global Settings API
      toast.info("Saving settings updates...");
      const finalPayload = {
        socialLinks,
        metadata: updatedMetadata,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) throw new Error("Failed to save settings to database");

      toast.success("Settings saved successfully!");
      
      // Clear pending file states so we dont re-upload on next save
      setLogoFile(null);
      setSceneFiles([]);
      
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
      {/* Social Media Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>
                Manage social media profiles displayed on the website.
              </CardDescription>
            </div>
            <Button size="sm" onClick={addSocialLink} disabled={isSaving}>
              Add Link
            </Button>
          </div>
        </CardHeader>
        <div className="px-6 pb-6">
          {socialLinks.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No social links added yet. Click &quot;Add Link&quot; to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {socialLinks.map((link, idx) => (
                <div key={link.id}>
                  {idx > 0 && <FieldSeparator />}
                  <div className="flex items-start gap-3 pt-2">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Field>
                          <FieldLabel>Platform</FieldLabel>
                          <Input
                            value={link.platform}
                            onChange={(e) =>
                              updateSocialLink(link.id, "platform", e.target.value)
                            }
                            placeholder="e.g. Facebook"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Icon Name</FieldLabel>
                          <Input
                            value={link.iconName}
                            onChange={(e) =>
                              updateSocialLink(link.id, "iconName", e.target.value)
                            }
                            placeholder="e.g. facebook"
                          />
                        </Field>
                        <Field>
                          <FieldLabel>URL</FieldLabel>
                          <Input
                            value={link.url}
                            onChange={(e) =>
                              updateSocialLink(link.id, "url", e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </Field>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="mt-6 shrink-0"
                      onClick={() => deleteSocialLink(link.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Website Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Website Metadata</CardTitle>
          <CardDescription>
            Configure the main website content and metadata.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="receivingEmail">Receiving Email</FieldLabel>
              <Input
                id="receivingEmail"
                name="receivingEmail"
                type="email"
                value={metadata.receivingEmail}
                onChange={handleMetaChange}
                placeholder="contact@example.com"
              />
              <FieldDesc>
                Email address where contact form submissions will be sent.
              </FieldDesc>
            </Field>

            {/* Logo */}
            <Field>
              <FieldLabel>Logo</FieldLabel>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-input bg-muted/50 p-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFile}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => logoFileRef.current?.click()}
                  >
                    {logoFileName || "Choose logo file"}
                  </Button>
                </div>
              </div>
            </Field>

            <FieldSeparator>3D Section</FieldSeparator>

            <Field>
              <FieldLabel htmlFor="section3dTitle">3D Section Title</FieldLabel>
              <Input
                id="section3dTitle"
                name="section3dTitle"
                value={metadata.section3dTitle}
                onChange={handleMetaChange}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="section3dDescription">
                3D Section Description
              </FieldLabel>
              <Textarea
                id="section3dDescription"
                name="section3dDescription"
                value={metadata.section3dDescription}
                onChange={handleMetaChange}
                rows={3}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="section3dSubtext">3D Section Subtext</FieldLabel>
              <Input
                id="section3dSubtext"
                name="section3dSubtext"
                value={metadata.section3dSubtext}
                onChange={handleMetaChange}
              />
            </Field>

            <Field>
              <FieldLabel>3D Scene Files</FieldLabel>
              <div>
                <input
                  ref={sceneFileRef}
                  type="file"
                  accept=".gltf,.glb,.bin,.png,.jpg,.jpeg"
                  multiple
                  onChange={handleSceneFiles}
                  className="hidden"
                />
                <div
                  onClick={() => sceneFileRef.current?.click()}
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
                  <p className="text-sm text-muted-foreground">
                    Click to choose 3D scene files (.gltf, .bin, textures)
                  </p>
                </div>
                {metadata.scene3dFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {metadata.scene3dFiles.map((file) => (
                      <Badge key={file} variant="secondary" className="text-xs">
                        {file}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Field>

            <FieldSeparator>Mission</FieldSeparator>

            <Field>
              <FieldLabel htmlFor="missionText">Our Mission Text</FieldLabel>
              <Textarea
                id="missionText"
                name="missionText"
                value={metadata.missionText}
                onChange={handleMetaChange}
                rows={4}
              />
            </Field>
          </FieldGroup>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
