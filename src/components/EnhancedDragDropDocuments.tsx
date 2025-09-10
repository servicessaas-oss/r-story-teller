import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  Plus,
  Eye,
  Download
} from "lucide-react";
import { type Good, type RequiredDocument } from "@/data/procedureData";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  documentId?: string;
  status: 'missing' | 'uploaded' | 'needs_payment' | 'sent_to_entity' | 'verified' | 'rejected';
  notes?: string;
  uploadedAt?: Date;
  rejectionReason?: string;
}

interface EnhancedDragDropDocumentsProps {
  selectedGoods: Good[];
  requiredDocuments: RequiredDocument[];
  uploadedFiles: UploadedFile[];
  onFileUpload: (files: File[], documentId: string) => void;
  onFileRemove: (fileId: string) => void;
  onFileUpdate: (fileId: string, updates: Partial<UploadedFile>) => void;
  onNotesUpdate: (fileId: string, notes: string) => void;
}

export function EnhancedDragDropDocuments({
  selectedGoods,
  requiredDocuments,
  uploadedFiles,
  onFileUpload,
  onFileRemove,
  onFileUpdate,
  onNotesUpdate
}: EnhancedDragDropDocumentsProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files, documentId);
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) uploaded for ${requiredDocuments.find(doc => doc.id === documentId)?.name}`,
      });
      // Reset the input
      e.target.value = '';
    }
  }, [onFileUpload, requiredDocuments, toast]);

  const handleDrop = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files, documentId);
      toast({
        title: "Files dropped successfully", 
        description: `${files.length} file(s) dropped for ${requiredDocuments.find(doc => doc.id === documentId)?.name}`,
      });
    }
  }, [onFileUpload, requiredDocuments, toast]);

  const handleDragOver = useCallback((e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOver(documentId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're leaving the document zone completely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDraggedOver(null);
    }
  }, []);

  const triggerFileInput = useCallback((documentId: string) => {
    const input = fileInputRefs.current[documentId];
    if (input) {
      input.click();
    }
  }, []);

  const getDocumentFiles = (documentId: string) => {
    return uploadedFiles.filter(file => file.documentId === documentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Required commercial documents</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag and drop or click to upload your documents to their designated areas
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requiredDocuments.map((doc) => (
            <Card 
              key={doc.id} 
              className={`${
                getDocumentFiles(doc.id).length > 0 ? 'border-green-200 bg-green-50/50' : 
                doc.isRequired ? 'border-red-200 bg-red-50/50' : 'border-border'
              } transition-all duration-200 hover:shadow-md relative ${
                draggedOver === doc.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {doc.name}
                    {doc.isRequired && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    {getDocumentFiles(doc.id).length > 0 && (
                      <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                        {getDocumentFiles(doc.id).length} file(s)
                      </Badge>
                    )}
                  </CardTitle>
                </div>
                {doc.description && (
                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Zone de Drag & Drop améliorée */}
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    draggedOver === doc.id
                      ? 'border-primary bg-primary/10 scale-105' 
                      : getDocumentFiles(doc.id).length > 0 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300 hover:border-primary hover:bg-accent/50 hover:scale-105'
                  }`}
                  onDrop={(e) => handleDrop(e, doc.id)}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragEnter={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e, doc.id)}
                    className="hidden"
                    ref={(el) => fileInputRefs.current[doc.id] = el}
                  />
                  
                  {draggedOver === doc.id ? (
                    <div className="space-y-2 animate-pulse">
                      <div className="flex items-center justify-center text-primary">
                        <Upload className="h-12 w-12" />
                      </div>
                      <p className="text-lg font-medium text-primary">
                        Drop files here
                      </p>
                      <p className="text-sm text-primary/70">
                        Release to upload
                      </p>
                    </div>
                  ) : getDocumentFiles(doc.id).length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-green-600">
                        <Check className="h-10 w-10" />
                      </div>
                      <p className="text-sm font-medium text-green-700">
                        {getDocumentFiles(doc.id).length} file(s) uploaded
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerFileInput(doc.id)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-gray-400">
                        <Upload className="h-10 w-10" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Drag your files here</p>
                        <p className="text-xs text-gray-500 mb-2">or</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileInput(doc.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                      {/* Formats acceptés statiques pour l'instant */}
                      <p className="text-xs text-gray-500 mt-2">
                        Formats: PDF, DOC, DOCX, JPG, PNG
                      </p>
                    </div>
                  )}
                </div>

                {/* Liste des fichiers téléchargés */}
                {getDocumentFiles(doc.id).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files:</h4>
                    {getDocumentFiles(doc.id).map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-background rounded border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            onClick={() => onFileRemove(file.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {getDocumentFiles(doc.id).length > 0 && (
                  <div>
                    <Input
                      placeholder="Notes for this document..."
                      className="text-sm"
                      value={getDocumentFiles(doc.id)[0]?.notes || ''}
                      onChange={(e) => {
                        const firstFile = getDocumentFiles(doc.id)[0];
                        if (firstFile) {
                          onNotesUpdate(firstFile.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Résumé des fichiers */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Document Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {requiredDocuments.filter(doc => doc.isRequired).length}
              </div>
              <div className="text-muted-foreground">Required</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {requiredDocuments.filter(doc => getDocumentFiles(doc.id).length > 0).length}
              </div>
              <div className="text-muted-foreground">Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {uploadedFiles.length}
              </div>
              <div className="text-muted-foreground">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {requiredDocuments.filter(doc => doc.isRequired && getDocumentFiles(doc.id).length === 0).length}
              </div>
              <div className="text-muted-foreground">Missing</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}