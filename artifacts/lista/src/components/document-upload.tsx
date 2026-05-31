import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import type { TraineeDocument } from "@/lib/institutional-data";
import { uploadTraineeDocument } from "@/lib/trainee-document-upload";

interface DocumentUploadProps {
  label: string;
  docType: TraineeDocument["type"];
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  allowedExtensions?: string[];
  maxSizeMB?: number;
  /** Restore UI when documents were saved in a prior session. */
  initialFile?: { name: string; url: string } | null;
}

export function DocumentUpload({
  label,
  docType,
  onUploadComplete,
  allowedExtensions = ["pdf", "jpg", "jpeg", "png"],
  maxSizeMB = 5,
  initialFile = null,
}: DocumentUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(
    initialFile,
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setError(`Invalid file type. Allowed: ${allowedExtensions.join(", ")}`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size is ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const progressInterval = window.setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      const result = await uploadTraineeDocument(file, docType, user?.id, label);
      window.clearInterval(progressInterval);
      setProgress(100);

      setUploadedFile({ name: result.fileName, url: result.fileUrl });
      onUploadComplete(result.fileUrl, result.fileName);

      toast({
        title: "Upload successful",
        description:
          result.storage === "local"
            ? `${label} saved on this device and will appear on your TESDA form.`
            : `${label} has been uploaded to LISTA.`,
      });
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "Failed to upload file";
      setError(message);
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        {uploadedFile && (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> UPLOADED
          </span>
        )}
      </div>

      {!uploadedFile ? (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${isUploading ? "bg-muted/50 border-muted" : "bg-white border-slate-200 hover:border-primary/50 hover:bg-slate-50"}
            ${error ? "border-destructive/50 bg-destructive/5" : ""}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            data-testid={`document-upload-${docType}`}
            onChange={handleFileSelect}
            className="hidden"
            accept={allowedExtensions.map((ext) => `.${ext}`).join(",")}
            disabled={isUploading}
          />

          <div className="space-y-2">
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="w-full max-w-[150px] space-y-1">
                  <Progress value={progress} className="h-1" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                    Uploading… {progress}%
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">
                    {allowedExtensions.join(", ")} (Max {maxSizeMB}MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative group overflow-hidden bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/30">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{uploadedFile.name}</p>
            <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-tight">
              Upload complete
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/10"
            onClick={removeFile}
            type="button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-3 h-3" />
          <p className="text-[10px] font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}
    </div>
  );
}
