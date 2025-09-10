import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Building } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
}

interface SendAndSignProps {
  files: UploadedFile[];
  acidNumber: string;
  onSign: () => void;
  onBack: () => void;
}

export function SendAndSign({ files, acidNumber, onSign, onBack }: SendAndSignProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Send & Sign Documents
          </CardTitle>
          <CardDescription>
            Review your envelope before signing and transferring to the blockchain
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">ACID Number</p>
            <p className="font-mono text-lg">{acidNumber}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recipient</p>
            <div className="flex items-center gap-2 mt-1">
              <Building className="h-4 w-4 text-primary" />
              <span className="font-medium">Egyptian Customs Platform NAFEZA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documents to Transfer</CardTitle>
          <CardDescription>
            {files.length} document{files.length !== 1 ? 's' : ''} ready for transfer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                    {index + 1}
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    {file.type && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {file.type}
                        </Badge>
                        {file.certificateNumber && (
                          <span className="text-xs text-muted-foreground">
                            #{file.certificateNumber}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm leading-relaxed">
                I understand that once I sign this transaction, the transfer of documents is final and cannot be reverted. 
                The documents will be securely stored and the transaction will be recorded on the blockchain.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Compose
        </Button>
        <Button
          onClick={onSign}
          variant="action"
          size="lg"
          disabled={!agreedToTerms}
          className="bg-action hover:bg-action/90"
        >
          <Shield className="h-4 w-4 mr-2" />
          Sign and Transfer
        </Button>
      </div>
    </div>
  );
}