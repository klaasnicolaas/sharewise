"use client";

import { useRef, useState } from "react";
import { FileJson, Upload, X } from "lucide-react";
import { z } from "zod";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialogBody,
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { cn } from "@/lib/utils";
import type { ProjectData } from "@/lib/calculations/types";
import { projectSchema } from "@/lib/calculations/validation";

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: ProjectData) => void;
}) {
  const { copy } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<string>("");

  function resetState() {
    setFileContents("");
    setSelectedFileName(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDialogChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  }

  function parseAndImport() {
    try {
      const parsed = projectSchema.parse(JSON.parse(fileContents));
      onImport(parsed as ProjectData);
      resetState();
      onOpenChange(false);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setErrorMessage(copy.importDialog.invalidJson);
        return;
      }
      if (error instanceof z.ZodError) {
        setErrorMessage(error.issues[0]?.message ?? copy.importDialog.invalidProjectFile);
      }
    }
  }

  async function loadFile(file: File) {
    setErrorMessage(null);
    setSelectedFileName(file.name);

    try {
      const raw = await file.text();
      setFileContents(raw);
    } catch {
      setErrorMessage(copy.importDialog.unreadableFile);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleDialogChange}>
      <ResponsiveDialogContent
        className="overflow-hidden p-0"
        dialogClassName="w-[min(92vw,48rem)] max-w-[min(92vw,48rem)] sm:max-w-[48rem]"
      >
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{copy.importDialog.title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{copy.importDialog.description}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="space-y-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void loadFile(file);
              }
            }}
          />
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "w-full rounded-3xl border border-dashed border-border/80 bg-linear-to-br from-muted/20 to-background p-8 text-left transition-colors",
              "hover:border-primary/40 hover:from-primary/6 hover:to-background",
              "focus-visible:border-primary/50 focus-visible:outline-none",
            )}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files?.[0];
              if (file) {
                void loadFile(file);
              }
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Upload className="size-5" />
              </div>
              <p className="text-base font-semibold text-foreground">
                {copy.importDialog.dropTitle}
              </p>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {copy.importDialog.dropDescription}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 gap-2 border-border/80 bg-background/90"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <FileJson className="size-4" />
                {copy.importDialog.chooseFile}
              </Button>
            </div>
          </div>

          {selectedFileName && (
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card px-4 py-3.5 shadow-xs">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {copy.importDialog.selectedFile}
                </p>
                <p className="truncate text-sm font-medium text-foreground">{selectedFileName}</p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={resetState}>
                <X className="size-4" />
              </Button>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button type="button" variant="ghost" onClick={resetState}>
            {copy.common.clear}
          </Button>
          <Button type="button" disabled={!fileContents.trim()} onClick={parseAndImport}>
            {copy.importDialog.import}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
