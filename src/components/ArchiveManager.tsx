import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Search, Download, FileText, Calendar, Package, CheckCircle, Building2, RotateCcw } from "lucide-react";

interface ArchivedEnvelope {
  id: string;
  acidNumber: string;
  recipient: string;
  status: 'archived_delivered' | 'archived_completed' | 'archived_expired';
  files: Array<{ name: string; type?: string }>;
  archivedDate: string;
  originalDate: string;
  completionDate?: string;
  tags: string[];
  archiveReason: string;
}

const mockArchivedEnvelopes: ArchivedEnvelope[] = [
  {
    id: "arch-1",
    acidNumber: "AC12300",
    recipient: "Sudan Customs Authority (SCA)",
    status: "archived_delivered",
    files: [
      { name: "certificate_of_origin.pdf", type: "Certificate of Origin" },
      { name: "commercial_invoice.pdf", type: "Commercial Invoice" }
    ],
    archivedDate: "2024-01-10",
    originalDate: "2023-12-15",
    completionDate: "2023-12-20",
    tags: ["customs", "import", "textiles"],
    archiveReason: "Successfully completed - 30 days retention period"
  },
  {
    id: "arch-2",
    acidNumber: "AC12301",
    recipient: "Sea Ports Corporation (SPC)",
    status: "archived_completed",
    files: [
      { name: "bill_of_lading.pdf", type: "Bill of Lading" },
      { name: "cargo_manifest.pdf", type: "Cargo Manifest" }
    ],
    archivedDate: "2024-01-08",
    originalDate: "2023-12-10",
    completionDate: "2023-12-18",
    tags: ["shipping", "port", "containers"],
    archiveReason: "Port clearance completed - moved to archive"
  },
  {
    id: "arch-3",
    acidNumber: "AC12302",
    recipient: "Ministry of Trade and Industry",
    status: "archived_expired",
    files: [
      { name: "import_license.pdf", type: "Import License" }
    ],
    archivedDate: "2024-01-05",
    originalDate: "2023-11-20",
    completionDate: undefined,
    tags: ["license", "ministry", "expired"],
    archiveReason: "Document expired - no response received"
  },
  {
    id: "arch-4",
    acidNumber: "AC12303",
    recipient: "Central Bank of Sudan",
    status: "archived_delivered",
    files: [
      { name: "foreign_exchange_form.pdf", type: "FX Form" },
      { name: "bank_guarantee.pdf", type: "Bank Guarantee" }
    ],
    archivedDate: "2024-01-03",
    originalDate: "2023-12-01",
    completionDate: "2023-12-15",
    tags: ["banking", "fx", "guarantee"],
    archiveReason: "Banking process completed successfully"
  },
  {
    id: "arch-5",
    acidNumber: "AC12304",
    recipient: "Freight Forwarders",
    status: "archived_completed",
    files: [
      { name: "shipping_instructions.pdf", type: "Shipping Instructions" },
      { name: "packing_list.pdf", type: "Packing List" }
    ],
    archivedDate: "2024-01-01",
    originalDate: "2023-11-25",
    completionDate: "2023-12-10",
    tags: ["freight", "shipping", "logistics"],
    archiveReason: "Cargo delivered to destination"
  }
];

interface ArchiveManagerProps {
  onUnarchive: (envelopeId: string) => void;
  onDownload: (envelopeId: string) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'archived_delivered':
      return <Badge variant="default" className="bg-green-500">Delivered</Badge>;
    case 'archived_completed':
      return <Badge variant="default" className="bg-blue-500">Completed</Badge>;
    case 'archived_expired':
      return <Badge variant="secondary">Expired</Badge>;
    default:
      return <Badge variant="outline">Archived</Badge>;
  }
};

export function ArchiveManager({ onUnarchive, onDownload }: ArchiveManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [archivedEnvelopes] = useState<ArchivedEnvelope[]>(mockArchivedEnvelopes);

  const filteredEnvelopes = archivedEnvelopes.filter(envelope => {
    const matchesSearch = 
      envelope.acidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      envelope.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      envelope.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      envelope.files.some(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "delivered") return matchesSearch && envelope.status === "archived_delivered";
    if (selectedTab === "completed") return matchesSearch && envelope.status === "archived_completed";
    if (selectedTab === "expired") return matchesSearch && envelope.status === "archived_expired";
    
    return matchesSearch;
  });

  const deliveredCount = archivedEnvelopes.filter(e => e.status === "archived_delivered").length;
  const completedCount = archivedEnvelopes.filter(e => e.status === "archived_completed").length;
  const expiredCount = archivedEnvelopes.filter(e => e.status === "archived_expired").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Archive</h2>
          <p className="text-muted-foreground">View and manage your archived envelopes</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {archivedEnvelopes.length} archived envelopes
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search archived envelopes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Archives ({archivedEnvelopes.length})</TabsTrigger>
          <TabsTrigger value="delivered">Delivered ({deliveredCount})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expiredCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {filteredEnvelopes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchTerm ? "No archived envelopes found" : "No archived envelopes"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Completed envelopes will appear here after archiving"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredEnvelopes.map((envelope) => (
                <Card key={envelope.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          ACID: {envelope.acidNumber}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {envelope.recipient}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(envelope.status)}
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Archive Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Original Date</p>
                        <p className="font-medium">{envelope.originalDate}</p>
                      </div>
                      {envelope.completionDate && (
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium">{envelope.completionDate}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Archived</p>
                        <p className="font-medium">{envelope.archivedDate}</p>
                      </div>
                    </div>

                    {/* Files */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Documents ({envelope.files.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {envelope.files.map((file, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {envelope.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Archive Reason */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Archive Reason</p>
                      <p className="text-sm">{envelope.archiveReason}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => onDownload(envelope.id)} 
                        variant="outline" 
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        onClick={() => onUnarchive(envelope.id)} 
                        variant="outline" 
                        size="sm"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Unarchive
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}