import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Search, MessageCircle, ArrowLeft, FileText, CheckCircle, Clock } from "lucide-react";
import { LegalEntityEmailModal } from "./LegalEntityEmailModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LegalEntity {
  id: string;
  name: string;
  entity_type: string;
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  created_at?: string;
  // Legacy fields for display compatibility
  type?: string;
  entityNumber?: string;
  documentsProcessed?: number;
  averageProcessingTime?: string;
  lastInteraction?: string;
  status?: 'active' | 'pending' | 'inactive';
  documentHistory?: Array<{
    id: string;
    type: string;
    status: 'validated' | 'pending' | 'rejected';
    date: string;
    acidNumber: string;
  }>;
}

// Remove the hardcoded mock data - now using database entities

interface LegalEntitiesProps {
  onEntitySelect: (entityId: string) => void;
  onBack: () => void;
}

interface LegalEntityProfileProps {
  entity: LegalEntity;
  onBack: () => void;
  onStartChat: (entityId: string) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default';
    case 'pending': return 'secondary';
    case 'inactive': return 'outline';
    default: return 'outline';
  }
};

const getDocumentStatusIcon = (status: string) => {
  switch (status) {
    case 'validated': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'rejected': return <FileText className="h-4 w-4 text-red-500" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

function LegalEntityProfile({ entity, onBack, onStartChat }: LegalEntityProfileProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleStartChat = () => {
    setShowEmailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">{entity.name}</h2>
          <p className="text-muted-foreground">{entity.type || entity.entity_type?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Entity Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Entity ID</label>
              <p className="text-lg font-semibold">{entity.entityNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(entity.status || 'active')}>
                  {(entity.status || 'active').charAt(0).toUpperCase() + (entity.status || 'active').slice(1)}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Interaction</label>
              <p className="text-sm">{entity.lastInteraction || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Documents Processed</label>
              <p className="text-2xl font-bold text-primary">{entity.documentsProcessed || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Average Processing Time</label>
              <p className="text-lg font-semibold">{entity.averageProcessingTime || 'N/A'}</p>
            </div>
            <Button onClick={handleStartChat} className="w-full" variant="action">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document History
          </CardTitle>
          <CardDescription>
            Recent documents sent and validated with {entity.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(entity.documentHistory || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No document history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(entity.documentHistory || []).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDocumentStatusIcon(doc.status)}
                    <div>
                      <p className="font-medium">{doc.type}</p>
                      <p className="text-sm text-muted-foreground">ACID: {doc.acidNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getStatusBadgeVariant(doc.status === 'validated' ? 'active' : doc.status)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">{doc.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LegalEntityEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        preselectedLegalEntity={entity.id}
      />
    </div>
  );
}

export function LegalEntities({ onEntitySelect, onBack }: LegalEntitiesProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<LegalEntity | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedEntityForEmail, setSelectedEntityForEmail] = useState<string>("");
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch legal entities from database
  useEffect(() => {
    const fetchLegalEntities = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('legal_entities')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        // Transform database entities to match interface and add mock display data
        const transformedEntities = (data || []).map((entity, index) => ({
          ...entity,
          type: entity.entity_type?.replace(/_/g, ' ') || 'Unknown',
          entityNumber: `${entity.entity_type?.toUpperCase() || 'ENT'}-${String(index + 1).padStart(3, '0')}`,
          documentsProcessed: Math.floor(Math.random() * 300) + 20,
          averageProcessingTime: `${(Math.random() * 5 + 0.5).toFixed(1)} hours`,
          lastInteraction: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: Math.random() > 0.8 ? 'pending' : Math.random() > 0.1 ? 'active' : 'inactive' as const,
          documentHistory: [], // Empty for simplicity, could be populated from another table
          contact_info: typeof entity.contact_info === 'object' && entity.contact_info ? entity.contact_info as {
            email?: string;
            phone?: string;
            address?: string;
            website?: string;
          } : undefined
        } as LegalEntity));
        
        setLegalEntities(transformedEntities);
      } catch (error) {
        console.error('Error fetching legal entities:', error);
        toast({
          title: "Error",
          description: "Failed to load legal entities",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLegalEntities();
  }, [toast]);

  const filteredEntities = legalEntities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entity.type || entity.entity_type)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEntityClick = (entity: LegalEntity) => {
    setSelectedEntity(entity);
  };

  const handleBackToList = () => {
    setSelectedEntity(null);
  };

  const handleStartChat = (entityId: string) => {
    setSelectedEntityForEmail(entityId);
    setShowEmailModal(true);
  };

  if (selectedEntity) {
    return (
      <LegalEntityProfile
        entity={selectedEntity}
        onBack={handleBackToList}
        onStartChat={handleStartChat}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Legal Entities</h2>
          <p className="text-muted-foreground">Manage your legal entity partnerships and communications</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Loading legal entities...</p>
          </div>
        ) : filteredEntities.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No legal entities found</p>
          </div>
        ) : (
          filteredEntities.map((entity) => (
          <Card key={entity.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEntityClick(entity)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-sm font-semibold">{entity.name}</CardTitle>
                    <CardDescription className="text-xs">{entity.type || entity.entity_type?.replace(/_/g, ' ')}</CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(entity.status || 'active')} className="text-xs">
                  {entity.status || 'active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">{entity.entityNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Documents:</span>
                  <span className="font-medium">{entity.documentsProcessed || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Avg. Time:</span>
                  <span className="font-medium">{entity.averageProcessingTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Contact:</span>
                  <span className="font-medium">{entity.lastInteraction || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>

      <LegalEntityEmailModal
        open={showEmailModal}
        onOpenChange={setShowEmailModal}
        preselectedLegalEntity={selectedEntityForEmail}
      />
    </div>
  );
}