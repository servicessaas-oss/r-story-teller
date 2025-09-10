import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Settings, Send, ArrowLeft, DollarSign } from "lucide-react";
import { DocumentPropertiesModal } from "./DocumentPropertiesModal";
import { type Good, type RequiredDocument } from "@/data/procedureData";

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
  documentId?: string; // Links to required document
}

interface ComposeEnvelopeProps {
  procedureType: 'export' | 'import';
  selectedGoods: Good[];
  requiredDocuments: RequiredDocument[];
  totalFees: number;
  onSendAndSign: (files: UploadedFile[], acidNumber: string, workflowData: WorkflowData) => void;
  onBack: () => void;
}

interface WorkflowData {
  procedureType: 'export' | 'import';
  selectedGoods: Good[];
  requiredDocuments: RequiredDocument[];
  totalFees: number;
}

export function ComposeEnvelope({ 
  procedureType, 
  selectedGoods, 
  requiredDocuments, 
  totalFees, 
  onSendAndSign, 
  onBack 
}: ComposeEnvelopeProps) {
  const [acidNumber, setAcidNumber] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const handlePropertiesClick = (file: UploadedFile) => {
    setSelectedFile(file);
    setShowPropertiesModal(true);
  };

  const handleSaveProperties = (file: UploadedFile, type: string, certificateNumber?: string) => {
    // Find matching required document
    const matchingDoc = requiredDocuments.find(doc => doc.name === type);
    
    setUploadedFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { ...f, type, certificateNumber, documentId: matchingDoc?.id }
        : f
    ));
    setShowPropertiesModal(false);
    setSelectedFile(null);
  };

  const canProceed = acidNumber && uploadedFiles.length > 0;

  const workflowData: WorkflowData = {
    procedureType,
    selectedGoods,
    requiredDocuments,
    totalFees
  };

  // Check completion status for required documents
  const getDocumentCompletionStatus = () => {
    const uploadedDocTypes = uploadedFiles.map(f => f.documentId).filter(Boolean);
    const requiredDocIds = requiredDocuments.filter(d => d.isRequired).map(d => d.id);
    return {
      completed: uploadedDocTypes.filter(id => requiredDocIds.includes(id!)).length,
      total: requiredDocIds.length
    };
  };

  const completionStatus = getDocumentCompletionStatus();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {procedureType === 'export' ? 'Export' : 'Import'} Envelope
          </h1>
          <p className="text-muted-foreground">
            Upload required documents for your {procedureType} procedure
          </p>
        </div>
      </div>

      {/* Procedure Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Procedure Summary</CardTitle>
          <CardDescription>Selected goods and processing fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Selected Goods:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedGoods.map((good) => (
                  <Badge key={good.id} variant="secondary" className="text-xs">
                    {good.name}
                  </Badge>
                ))}
              </div>
            </div>
            {totalFees > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-medium">Total Processing Fees:</span>
                <div className="flex items-center gap-1 text-lg font-bold text-primary">
                  <DollarSign className="h-5 w-5" />
                  ${(totalFees / 100).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Shipment Information</CardTitle>
          <CardDescription>Enter the ACID number for this shipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="acid" className="block text-sm font-medium">
              ACID Number *
            </label>
            <Input
              id="acid"
              type="text"
              placeholder="Enter ACID number"
              value={acidNumber}
              onChange={(e) => setAcidNumber(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center justify-between">
            Required Documents
            <Badge variant="secondary">
              {completionStatus.completed}/{completionStatus.total} completed
            </Badge>
          </CardTitle>
          <CardDescription>Upload the following documents for your {procedureType} procedure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            {/* Group documents by legal entity */}
            {Object.entries(
              requiredDocuments.reduce((acc, doc) => {
                const entity = doc.legalEntityName;
                if (!acc[entity]) acc[entity] = [];
                acc[entity].push(doc);
                return acc;
              }, {} as Record<string, typeof requiredDocuments>)
            ).map(([entityName, entityDocs]) => (
              <div key={entityName} className="space-y-3">
                <div className="flex items-center gap-3 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <h3 className="font-semibold text-primary">{entityName}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Request from this entity
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Contact {entityName} to request the following documents:
                </p>
                <div className="grid grid-cols-1 gap-3 ml-6">
                  {entityDocs.map((doc) => {
                    const isUploaded = uploadedFiles.some(f => f.documentId === doc.id);
                    return (
                      <div key={doc.id} className={`p-3 border rounded-lg ${isUploaded ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{doc.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {doc.isRequired && (
                                <Badge variant={isUploaded ? "default" : "secondary"} className="text-xs">
                                  {isUploaded ? "✓ Uploaded" : "Required"}
                                </Badge>
                              )}
                              {!isUploaded && (
                                <span className="text-xs text-muted-foreground">
                                  → Request from {entityName}
                                </span>
                              )}
                            </div>
                          </div>
                          {doc.fee && (
                            <div className="text-right ml-2">
                              <div className="flex items-center gap-1 text-xs font-medium text-primary">
                                <DollarSign className="h-3 w-3" />
                                ${(doc.fee / 100).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) {
                const newFiles: UploadedFile[] = files.map(file => ({
                  id: Math.random().toString(36).substr(2, 9),
                  name: file.name
                }));
                setUploadedFiles(prev => [...prev, ...newFiles]);
              }
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Drag and drop files here</strong>, or click to browse
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </label>
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploaded Files</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        {file.type && (
                          <p className="text-xs text-muted-foreground">
                            {file.type}
                            {file.certificateNumber && ` - ${file.certificateNumber}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePropertiesClick(file)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Properties
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {canProceed && (
        <div className="flex justify-end">
          <Button
            onClick={() => onSendAndSign(uploadedFiles, acidNumber, workflowData)}
            variant="action"
            size="lg"
          >
            <Send className="h-4 w-4 mr-2" />
            Continue to Send & Sign
          </Button>
        </div>
      )}

      {selectedFile && (
        <DocumentPropertiesModal
          isOpen={showPropertiesModal}
          onClose={() => {
            setShowPropertiesModal(false);
            setSelectedFile(null);
          }}
          file={selectedFile}
          requiredDocuments={requiredDocuments}
          onSave={handleSaveProperties}
        />
      )}
    </div>
  );
}