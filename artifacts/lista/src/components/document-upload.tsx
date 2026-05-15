import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { lista } from "@/lib/insforge";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  label: string;
  docType: string;
  onUploadComplete: (fileUrl: string, fileName: string) => void;
  allowedExtensions?: string[];
  maxSizeMB?: number;
}

export function DocumentUpload({
  label,
  docType,
  onUploadComplete,
  allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'],
  maxSizeMB = 5
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setProgress(0);

    // Validate extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size is ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a unique file name
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `trainee-documents/${docType}/${fileName}`;

      // Simulate progress for better UX (Insforge SDK might not support real progress out of the box)
      const progressInterval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? 90 : prev + 10));
      }, 200);

      const { data, error: uploadError } = await lista.storage
        .from('trainee-documents')
        .upload(filePath, file);

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) throw uploadError;

      const urlResult = lista.storage.from("trainee-documents").getPublicUrl(filePath);
      const publicUrl =
        typeof urlResult === "string"
          ? urlResult
          : (urlResult as { data?: { publicUrl?: string } })?.data?.publicUrl ?? "";

      setUploadedFile({ name: file.name, url: publicUrl });
      onUploadComplete(publicUrl, file.name);
      
      toast({
        title: "Upload Successful",
        description: `${label} has been uploaded.`,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
      toast({
        title: "Upload Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
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
            <CheckCircle2 className="w-3 h-3" /> VERIFIED
          </span>
        )}
      </div>

      {!uploadedFile ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
            ${isUploading ? 'bg-muted/50 border-muted' : 'bg-white border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
            ${error ? 'border-destructive/50 bg-destructive/5' : ''}
          `}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept={allowedExtensions.map(ext => `.${ext}`).join(',')}
            disabled={isUploading}
          />
          
          <div className="space-y-2">
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="w-full max-w-[150px] space-y-1">
                  <Progress value={progress} className="h-1" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Uploading... {progress}%</p>
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
                    {allowedExtensions.join(', ')} (Max {maxSizeMB}MB)
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
            <p className="text-[10px] text-emerald-600 font-medium uppercase tracking-tight">Upload Complete</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/10"
            onClick={removeFile}
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
