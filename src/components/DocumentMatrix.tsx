import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Settings, CheckCircle, AlertCircle, Clock, DollarSign, Eye, Download, X } from "lucide-react";
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

interface DocumentMatrixProps {
  selectedGoods: Good[];
  requiredDocuments: RequiredDocument[];
  uploadedFiles: UploadedFile[];
  onFileUpload: (files: File[], documentId: string) => void;
  onFileRemove: (fileId: string) => void;
  onFileUpdate: (fileId: string, updates: Partial<UploadedFile>) => void;
  onNotesUpdate: (fileId: string, notes: string) => void;
}

export function DocumentMatrix({
  selectedGoods,
  requiredDocuments,
  uploadedFiles,
  onFileUpload,
  onFileRemove,
  onFileUpdate,
  onNotesUpdate
}: DocumentMatrixProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleDragOver = (e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    setDraggedOver(documentId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, documentId: string) => {
    e.preventDefault();
    setDraggedOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files, documentId);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files, documentId);
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully`,
      });
    }
    e.target.value = '';
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'missing': return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      case 'uploaded': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'needs_payment': return <DollarSign className="h-4 w-4 text-yellow-500" />;
      case 'sent_to_entity': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <X className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: UploadedFile['status']) => {
    const variants: Record<UploadedFile['status'], string> = {
      'missing': 'secondary',
      'uploaded': 'default',
      'needs_payment': 'secondary',
      'sent_to_entity': 'secondary',
      'verified': 'default',
      'rejected': 'destructive'
    };

    const labels: Record<UploadedFile['status'], string> = {
      'missing': 'Missing',
      'uploaded': 'Uploaded',
      'needs_payment': 'Needs Payment',
      'sent_to_entity': 'Sent to Entity',
      'verified': 'Verified',
      'rejected': 'Rejected'
    };

    return (
      <Badge variant={variants[status] as any} className="text-xs">
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          {labels[status]}
        </div>
      </Badge>
    );
  };

  const toggleRowExpansion = (documentId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(documentId)) {
      newExpanded.delete(documentId);
    } else {
      newExpanded.add(documentId);
    }
    setExpandedRows(newExpanded);
  };

  const getDocumentFiles = (documentId: string) => {
    return uploadedFiles.filter(file => file.documentId === documentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Documents Matrix</CardTitle>
        <CardDescription>
          Upload and manage documents for each selected good and legal entity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 rounded-lg text-sm font-medium">
            <div className="col-span-3">Document</div>
            <div className="col-span-2">Legal Entity</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Fee</div>
            <div className="col-span-2">Upload</div>
            <div className="col-span-3">Notes</div>
          </div>

          {/* Document Rows */}
          {requiredDocuments.map((doc) => {
            const documentFiles = getDocumentFiles(doc.id);
            const isExpanded = expandedRows.has(doc.id);
            const mainStatus = documentFiles.length > 0 ? documentFiles[0].status : 'missing';

            return (
              <div key={doc.id} className={`border rounded-lg relative ${
                draggedOver === doc.id ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                {/* Main Row */}
                <div 
                  className={`grid grid-cols-12 gap-4 p-3 cursor-pointer hover:bg-muted/25 transition-all duration-200 ${
                    draggedOver === doc.id ? 'opacity-50' : ''
                  }`}
                  onClick={() => toggleRowExpansion(doc.id)}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, doc.id)}
                >
                  <div className="col-span-3">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">{doc.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                        {doc.isRequired && (
                          <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Badge variant="outline" className="text-xs">
                      {doc.legalEntityName}
                    </Badge>
                  </div>

                  <div className="col-span-1">
                    {getStatusBadge(mainStatus)}
                  </div>

                  <div className="col-span-1">
                    {doc.fee ? (
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <DollarSign className="h-3 w-3" />
                        ${(doc.fee / 100).toFixed(2)}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </div>

                  <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        id={`file-upload-${doc.id}`}
                        onChange={(e) => handleFileInputChange(e, doc.id)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <label htmlFor={`file-upload-${doc.id}`} className="cursor-pointer">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </label>
                      </Button>
                      {documentFiles.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {documentFiles.length} file{documentFiles.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                    <Input
                      placeholder="Add notes..."
                      className="text-xs"
                      value={documentFiles[0]?.notes || ''}
                      onChange={(e) => {
                        if (documentFiles[0]) {
                          onNotesUpdate(documentFiles[0].id, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Expanded Files View */}
                {isExpanded && documentFiles.length > 0 && (
                  <div className="border-t border-border p-3 bg-muted/25">
                    <h5 className="text-sm font-medium mb-3">Uploaded Files</h5>
                    <div className="space-y-2">
                      {documentFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-background rounded border"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                {file.uploadedAt && ` • Uploaded ${file.uploadedAt.toLocaleDateString()}`}
                              </p>
                              {file.status === 'rejected' && file.rejectionReason && (
                                <p className="text-xs text-red-600 mt-1">Rejected: {file.rejectionReason}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(file.status)}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onFileRemove(file.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Drop Zone */}
                {draggedOver === doc.id && (
                  <div className="absolute inset-0 border-2 border-dashed border-primary bg-primary/10 rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-primary">Drop files here</p>
                      <p className="text-xs text-primary/70 mt-1">Release to upload files</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}