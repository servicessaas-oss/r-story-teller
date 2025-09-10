import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
  documentId?: string;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  legalEntityName: string;
  isRequired: boolean;
  fee?: number;
}

interface DocumentPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFile;
  requiredDocuments?: RequiredDocument[];
  onSave: (file: UploadedFile, type: string, certificateNumber?: string) => void;
}

export function DocumentPropertiesModal({ 
  isOpen, 
  onClose, 
  file, 
  requiredDocuments = [], 
  onSave 
}: DocumentPropertiesModalProps) {
  const [selectedType, setSelectedType] = useState(file.type || "");
  const [certificateNumber, setCertificateNumber] = useState(file.certificateNumber || "");

  useEffect(() => {
    setSelectedType(file.type || "");
    setCertificateNumber(file.certificateNumber || "");
  }, [file]);

  const handleSave = () => {
    if (selectedType) {
      onSave(file, selectedType, certificateNumber);
    }
  };

  const selectedDocument = requiredDocuments.find(doc => doc.name === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-primary">Document Properties</DialogTitle>
          <DialogDescription>
            Configure properties for <strong>{file.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="document-type" className="block text-sm font-medium">
              Document Type *
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                {requiredDocuments.map((doc) => (
                  <SelectItem key={doc.id} value={doc.name} className="bg-background hover:bg-accent">
                    <div className="flex items-center justify-between w-full">
                      <span>{doc.name}</span>
                      {doc.isRequired && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDocument && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">{selectedDocument.description}</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedDocument.legalEntityName}</span>
                {selectedDocument.fee && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    ${(selectedDocument.fee / 100).toFixed(2)} fee
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="certificate-number" className="block text-sm font-medium">
              Certificate Number (Optional)
            </label>
            <Input
              id="certificate-number"
              type="text"
              placeholder="Enter certificate number"
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="action"
            disabled={!selectedType}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}