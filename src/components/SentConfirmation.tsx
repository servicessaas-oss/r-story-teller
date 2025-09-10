import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Building, Calendar, Hash, ArrowLeft } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type?: string;
  certificateNumber?: string;
}

interface SentConfirmationProps {
  files: UploadedFile[];
  acidNumber: string;
  onBackToDashboard: () => void;
}

export function SentConfirmation({ files, acidNumber, onBackToDashboard }: SentConfirmationProps) {
  const transactionId = `0x${Math.random().toString(16).substr(2, 40)}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-success/10 p-3">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
          </div>
          <CardTitle className="text-2xl text-primary">Transfer Successful!</CardTitle>
          <CardDescription className="text-base">
            Your documents have been securely transferred and recorded on the blockchain
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">ACID Number</p>
              <p className="font-mono">{acidNumber}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recipient</p>
              <div className="flex items-center gap-2 mt-1">
                <Building className="h-4 w-4 text-primary" />
                <span>Egyptian Customs Platform NAFEZA</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{currentDate}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs break-all">{transactionId}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transferred Documents</CardTitle>
            <CardDescription>
              {files.length} document{files.length !== 1 ? 's' : ''} successfully transferred
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <FileText className="h-4 w-4 text-success" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.name}</p>
                    {file.type && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
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
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-success">Transaction Confirmed</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your documents are now securely stored and the transaction has been permanently recorded on the blockchain. 
                  The recipient can access the documents using the transaction ID provided above.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onBackToDashboard} variant="action" size="lg">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}