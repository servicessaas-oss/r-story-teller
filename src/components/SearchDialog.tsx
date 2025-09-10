import { useState } from "react";
import { Search, File, Package, Building2, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'envelope' | 'document' | 'entity' | 'conversation';
  metadata?: string;
  onClick: () => void;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: string) => void;
}

const getResultIcon = (type: string) => {
  switch (type) {
    case 'envelope': return Package;
    case 'document': return File;
    case 'entity': return Building2;
    case 'conversation': return MessageCircle;
    default: return Search;
  }
};

const getResultBadgeVariant = (type: string) => {
  switch (type) {
    case 'envelope': return 'default';
    case 'document': return 'secondary';
    case 'entity': return 'outline';
    case 'conversation': return 'destructive';
    default: return 'outline';
  }
};

export function SearchDialog({ open, onOpenChange, onNavigate }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Mock search results - in a real app, this would be an API call
  const mockSearch = (searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const allResults: SearchResult[] = [
      {
        id: '1',
        title: 'ACID: AC12345 - Certificate of Origin',
        description: 'Delivered to Egyptian Customs Platform NAFEZA',
        type: 'envelope' as const,
        metadata: '2024-01-15 • Delivered',
        onClick: () => {
          onNavigate('dashboard');
          onOpenChange(false);
        }
      },
      {
        id: '2',
        title: 'Bill of Lading - Maersk Logistics',
        description: 'Processing shipment documents',
        type: 'document' as const,
        metadata: 'AC12346 • Processing',
        onClick: () => {
          onNavigate('drafts');
          onOpenChange(false);
        }
      },
      {
        id: '3',
        title: 'Egyptian Customs Platform NAFEZA',
        description: 'Government customs authority',
        type: 'entity' as const,
        metadata: 'Active entity',
        onClick: () => {
          onNavigate('legal-entities');
          onOpenChange(false);
        }
      },
      {
        id: '4',
        title: 'Support Conversation #1234',
        description: 'Help with document validation',
        type: 'conversation' as const,
        metadata: '2 hours ago',
        onClick: () => {
          onNavigate('inbox');
          onOpenChange(false);
        }
      }
    ];

    return allResults.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const searchResults = mockSearch(searchQuery);
    setResults(searchResults);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Everything
          </DialogTitle>
          <DialogDescription>
            Search envelopes, documents, entities, and conversations
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <Input
            placeholder="Type to search..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-shrink-0"
            autoFocus
          />

          <div className="flex-1 overflow-y-auto space-y-2">
            {query.trim() === '' ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Start typing to search...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              results.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <Button
                    key={result.id}
                    variant="ghost"
                    className="w-full h-auto p-3 justify-start text-left"
                    onClick={result.onClick}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Icon className="h-4 w-4 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{result.title}</h4>
                          <Badge 
                            variant={getResultBadgeVariant(result.type)}
                            className="text-xs flex-shrink-0"
                          >
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{result.description}</p>
                        {result.metadata && (
                          <p className="text-xs text-muted-foreground mt-1">{result.metadata}</p>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })
            )}
          </div>

          <div className="flex-shrink-0 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <kbd className="bg-muted px-2 py-1 rounded text-xs">↵</kbd>
              <span>to select</span>
              <kbd className="bg-muted px-2 py-1 rounded text-xs">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}