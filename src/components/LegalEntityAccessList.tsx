import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Filter, BarChart3, MessageSquare, Eye } from "lucide-react";

interface LegalEntityAccess {
  name: string;
  email: string;
  password: string;
  entityType: string;
  permissions: string[];
  capabilities: string[];
}

const legalEntityAccesses: LegalEntityAccess[] = [
  {
    name: "Sudan Customs Authority",
    email: "customs@sudan.com",
    password: "Customs2024!",
    entityType: "customs",
    permissions: ["View all envelopes", "Approve/Reject documents", "Request amendments", "Add comments"],
    capabilities: ["Document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Trade & Industry",
    email: "trade@sudan.com",
    password: "Trade2024!",
    entityType: "government",
    permissions: ["View assigned envelopes", "Approve/Reject trade documents", "Request amendments", "Add comments"],
    capabilities: ["Trade document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Agriculture",
    email: "agriculture@sudan.com",
    password: "Agriculture2024!",
    entityType: "government",
    permissions: ["View agricultural envelopes", "Approve/Reject agricultural documents", "Request amendments", "Add comments"],
    capabilities: ["Agricultural document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Central Bank of Sudan",
    email: "bank@sudan.com",
    password: "Bank2024!",
    entityType: "banking",
    permissions: ["View financial envelopes", "Approve/Reject financial documents", "Request amendments", "Add comments"],
    capabilities: ["Financial document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Chamber of Commerce",
    email: "chamber@sudan.com",
    password: "Chamber2024!",
    entityType: "chamber",
    permissions: ["View commercial envelopes", "Approve/Reject commercial documents", "Request amendments", "Add comments"],
    capabilities: ["Commercial document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Health",
    email: "health@sudan.com",
    password: "Health2024!",
    entityType: "government",
    permissions: ["View health-related envelopes", "Approve/Reject health documents", "Request amendments", "Add comments"],
    capabilities: ["Health document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Port Sudan",
    email: "port@sudan.com",
    password: "Port2024!",
    entityType: "logistics",
    permissions: ["View port envelopes", "Approve/Reject logistics documents", "Request amendments", "Add comments"],
    capabilities: ["Logistics document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Animal Resources & Fisheries",
    email: "animal-resources@sudan.com",
    password: "AnimalRes2024!",
    entityType: "government",
    permissions: ["View animal/fisheries envelopes", "Approve/Reject related documents", "Request amendments", "Add comments"],
    capabilities: ["Animal/Fisheries document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Energy And Oil",
    email: "energy@sudan.com",
    password: "Energy2024!",
    entityType: "government",
    permissions: ["View energy/oil envelopes", "Approve/Reject energy documents", "Request amendments", "Add comments"],
    capabilities: ["Energy/Oil document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Industry",
    email: "industry@sudan.com",
    password: "Industry2024!",
    entityType: "government",
    permissions: ["View industrial envelopes", "Approve/Reject industrial documents", "Request amendments", "Add comments"],
    capabilities: ["Industrial document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Interior / Defense",
    email: "interior@sudan.com",
    password: "Interior2024!",
    entityType: "government",
    permissions: ["View security envelopes", "Approve/Reject security documents", "Request amendments", "Add comments"],
    capabilities: ["Security document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Ministry of Minerals",
    email: "minerals@sudan.com",
    password: "Minerals2024!",
    entityType: "government",
    permissions: ["View mineral envelopes", "Approve/Reject mineral documents", "Request amendments", "Add comments"],
    capabilities: ["Mineral document review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Standards And Metrology Organization",
    email: "standards@sudan.com",
    password: "Standards2024!",
    entityType: "quality",
    permissions: ["View quality envelopes", "Approve/Reject quality documents", "Request amendments", "Add comments"],
    capabilities: ["Quality standards review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Sudan Gold Refinery",
    email: "gold-refinery@sudan.com",
    password: "GoldRef2024!",
    entityType: "laboratory",
    permissions: ["View gold refinery envelopes", "Approve/Reject laboratory reports", "Request amendments", "Add comments"],
    capabilities: ["Laboratory analysis review", "Status updates", "Workflow management", "Analytics dashboard"]
  },
  {
    name: "Sudan National Petroleum Laboratory",
    email: "petroleum-lab@sudan.com",
    password: "PetroLab2024!",
    entityType: "laboratory",
    permissions: ["View petroleum envelopes", "Approve/Reject petroleum reports", "Request amendments", "Add comments"],
    capabilities: ["Petroleum analysis review", "Status updates", "Workflow management", "Analytics dashboard"]
  }
];

const getEntityTypeColor = (type: string) => {
  switch (type) {
    case "customs": return "bg-blue-100 text-blue-800 border-blue-300";
    case "government": return "bg-green-100 text-green-800 border-green-300";
    case "banking": return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "chamber": return "bg-purple-100 text-purple-800 border-purple-300";
    case "logistics": return "bg-orange-100 text-orange-800 border-orange-300";
    case "quality": return "bg-pink-100 text-pink-800 border-pink-300";
    case "laboratory": return "bg-cyan-100 text-cyan-800 border-cyan-300";
    default: return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export const LegalEntityAccessList = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Legal Entity Access Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Below are all the legal entity accounts created in the system with their login credentials and access permissions.
          </p>
          
          <div className="grid gap-4">
            {legalEntityAccesses.map((entity, index) => (
              <Card key={index} className="border-l-4 border-l-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{entity.name}</CardTitle>
                    <Badge className={getEntityTypeColor(entity.entityType)}>
                      {entity.entityType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Login Credentials */}
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Login Credentials
                    </h4>
                    <div className="font-mono text-sm space-y-1">
                      <div><strong>Email:</strong> {entity.email}</div>
                      <div><strong>Password:</strong> {entity.password}</div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Document Permissions
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {entity.permissions.map((permission, pIndex) => (
                        <Badge key={pIndex} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      System Capabilities
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {entity.capabilities.map((capability, cIndex) => (
                        <Badge key={cIndex} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System-wide Access Rights */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Common Access Rights (All Legal Entities)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Document Management</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• View assigned envelopes and documents</li>
                    <li>• Approve or reject documents</li>
                    <li>• Request amendments with comments</li>
                    <li>• Track document status and history</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">System Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Access to analytics dashboard</li>
                    <li>• Real-time notifications</li>
                    <li>• Document search and filtering</li>
                    <li>• Workflow status updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};