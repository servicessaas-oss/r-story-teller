import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Package } from "lucide-react";
import { EnvelopeProgressRing } from "./EnvelopeProgressRing";

interface DraftEnvelope {
  id: string;
  acidNumber: string;
  overallStatus: 'pending_signatures' | 'awaiting_payment' | 'payment_confirmed' | 'sent_to_entities';
  completedCount: number;
  totalCount: number;
  entities: Array<{
    entityName: string;
    status: 'pending' | 'approved' | 'waiting' | 'rejected';
    documents: Array<{
      name: string;
      status: 'pending' | 'approved' | 'waiting' | 'rejected';
    }>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface DraftsPageProps {
  onCompose: () => void;
  onOpenEnvelope: (envelopeId: string) => void;
}

export function DraftsPage({ onCompose, onOpenEnvelope }: DraftsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data - replace with actual data fetching
  const draftEnvelopes: DraftEnvelope[] = [
    {
      id: "ENV-2025-000312",
      acidNumber: "ACID-2025-001",
      overallStatus: "pending_signatures",
      completedCount: 2,
      totalCount: 4,
      entities: [
        {
          entityName: "SSMO",
          status: "pending",
          documents: [
            { name: "Quality Conformity", status: "pending" }
          ]
        },
        {
          entityName: "Ministry of Industry",
          status: "approved",
          documents: [
            { name: "Compliance Validation", status: "approved" }
          ]
        },
        {
          entityName: "Sudan Customs Authority",
          status: "waiting",
          documents: [
            { name: "Customs Filing", status: "waiting" }
          ]
        }
      ],
      createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-12')
    },
    {
      id: "ENV-2025-000313",
      acidNumber: "ACID-2025-002",
      overallStatus: "sent_to_entities",
      completedCount: 3,
      totalCount: 3,
      entities: [
        {
          entityName: "Ministry of Agriculture",
          status: "approved",
          documents: [
            { name: "Phytosanitary Certificate", status: "approved" }
          ]
        },
        {
          entityName: "Chamber of Commerce",
          status: "approved",
          documents: [
            { name: "Certificate of Origin", status: "approved" }
          ]
        },
        {
          entityName: "Sudan Customs Authority",
          status: "approved",
          documents: [
            { name: "Export Declaration", status: "approved" }
          ]
        }
      ],
      createdAt: new Date('2025-01-08'),
      updatedAt: new Date('2025-01-11')
    }
  ];

  const filteredEnvelopes = draftEnvelopes.filter(envelope => {
    const matchesSearch = envelope.acidNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         envelope.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || envelope.overallStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEnvelope = (envelopeId: string) => {
    onOpenEnvelope(envelopeId);
  };

  const handleAddDocument = (envelopeId: string) => {
    console.log("Add document to envelope:", envelopeId);
  };

  const handleResubmit = (envelopeId: string) => {
    console.log("Resubmit envelope:", envelopeId);
  };

  const handleContactEntity = (entityName: string) => {
    console.log("Contact entity:", entityName);
  };

  const handleRefundRequest = (envelopeId: string) => {
    console.log("Request refund for envelope:", envelopeId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Draft Envelopes</h2>
          <p className="text-muted-foreground">
            Manage your pending document workflows and track progress
          </p>
        </div>
        <Button onClick={onCompose} variant="action">
          <Plus className="h-4 w-4 mr-2" />
          New Envelope
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by ACID number or envelope ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending_signatures">Pending Signatures</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="payment_confirmed">Payment Confirmed</option>
                <option value="sent_to_entities">Sent to Entities</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Envelopes Grid */}
      {filteredEnvelopes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery || statusFilter !== "all" ? "No matching envelopes" : "No draft envelopes"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first envelope to get started"
              }
            </p>
            {(!searchQuery && statusFilter === "all") && (
              <Button onClick={onCompose} variant="action">
                <Plus className="h-4 w-4 mr-2" />
                Create Envelope
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEnvelopes.map((envelope) => (
            <EnvelopeProgressRing
              key={envelope.id}
              envelopeId={envelope.id}
              acidNumber={envelope.acidNumber}
              overallStatus={envelope.overallStatus}
              entities={envelope.entities}
              completedCount={envelope.completedCount}
              totalCount={envelope.totalCount}
              onOpen={() => handleOpenEnvelope(envelope.id)}
              onAddDocument={() => handleAddDocument(envelope.id)}
              onResubmit={() => handleResubmit(envelope.id)}
              onContactEntity={handleContactEntity}
              onRefundRequest={() => handleRefundRequest(envelope.id)}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{filteredEnvelopes.length}</div>
              <div className="text-sm text-muted-foreground">Total Drafts</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredEnvelopes.filter(e => e.overallStatus === 'pending_signatures').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Signatures</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEnvelopes.filter(e => e.overallStatus === 'sent_to_entities').length}
              </div>
              <div className="text-sm text-muted-foreground">With Entities</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredEnvelopes.filter(e => e.completedCount === e.totalCount).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}