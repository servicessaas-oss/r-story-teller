import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEnvelopes } from "@/hooks/useEnvelopes";
import { toast } from "sonner";

export function EnvelopeAssignmentTest() {
  const [acidNumber, setAcidNumber] = useState("");
  const [legalEntityId, setLegalEntityId] = useState("0091e7e1-1c0d-4bf0-a885-eae3e4278f20"); // Sudan Customs Authority
  const [loading, setLoading] = useState(false);
  const { createEnvelope, sendEnvelope } = useEnvelopes();

  const legalEntities = [
    { id: "0091e7e1-1c0d-4bf0-a885-eae3e4278f20", name: "Sudan Customs Authority" },
    { id: "e8406e0f-1049-4077-a9f4-9793d164f834", name: "Ministry of Trade & Industry" },
    { id: "f7675be3-c463-427b-9cf0-bb0ff41fdc34", name: "Ministry of Agriculture" },
    { id: "e6dc78fc-3df6-4860-ad43-94a1fe7b47c5", name: "Central Bank of Sudan" },
  ];

  const handleCreateAndSendTestEnvelope = async () => {
    if (!acidNumber.trim()) {
      toast.error("Please enter an ACID number");
      return;
    }

    setLoading(true);
    try {
      // Create envelope
      const envelope = await createEnvelope({
        acid_number: acidNumber,
        files: [
          { name: "commercial_invoice.pdf", type: "commercial_invoice", size: 125000 },
          { name: "bill_of_lading.pdf", type: "bill_of_lading", size: 98000 }
        ],
        legal_entity_id: legalEntityId,
        total_amount: 15000,
        workflow_stages: [
          {
            stage: 1,
            legal_entity_id: legalEntityId,
            required_actions: ["verify", "approve"],
            is_current: true
          }
        ]
      });

      // Send envelope to trigger assignment
      await sendEnvelope(envelope.id);

      toast.success(`Test envelope ${acidNumber} created and sent! Assignment should be created automatically.`);
      setAcidNumber("");
    } catch (error) {
      console.error('Error creating test envelope:', error);
      toast.error('Failed to create test envelope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Envelope Assignment Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the envelope to legal entity assignment system
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">ACID Number</label>
          <Input
            placeholder="e.g., AC2025001"
            value={acidNumber}
            onChange={(e) => setAcidNumber(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Legal Entity</label>
          <Select value={legalEntityId} onValueChange={setLegalEntityId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {legalEntities.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>
                  {entity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={handleCreateAndSendTestEnvelope}
            disabled={loading || !acidNumber.trim()}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Test Envelope & Send"}
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>What this test does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Creates a new envelope with the specified ACID number</li>
              <li>Sets the status to "sent" to trigger automatic assignment</li>
              <li>The backend trigger should create an envelope_assignment record</li>
              <li>Legal entities should see this in their inbox</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}