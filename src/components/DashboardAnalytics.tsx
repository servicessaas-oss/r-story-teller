import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnvelopeReminder } from "@/components/EnvelopeReminder";
import { Plus, TrendingUp, TrendingDown, Clock, CheckCircle, Package, Users, BarChart3, AlertTriangle } from "lucide-react";

interface DashboardAnalyticsProps {
  onCompose: () => void;
  envelopes: Array<{
    id: string;
    recipient: string;
    status: 'draft' | 'pending_payment' | 'sent' | 'under_review' | 'approved' | 'rejected' | 'amendments_requested' | 'completed' | 'signed_and_approved';
    files: Array<{ name: string; type?: string }>;
    acidNumber: string;
    date: string;
  }>;
}

const mockAnalytics = {
  totalEnvelopes: 156,
  envelopesThisMonth: 23,
  averageProcessingTime: "2.4 hours",
  successRate: 94.2,
  topPartners: [
    { name: "Importers/Exporters", interactions: 312, change: +12 },
    { name: "Freight Forwarders", interactions: 234, change: +8 },
    { name: "Logistics Companies", interactions: 201, change: -3 },
    { name: "Customs Clearing Agents", interactions: 198, change: +15 },
    { name: "Warehousing Providers", interactions: 167, change: +5 },
  ],
  recentActivity: [
    { type: "envelope_created", time: "2 hours ago", description: "New envelope created for Sudan Customs Authority" },
    { type: "document_validated", time: "4 hours ago", description: "Certificate of Origin validated by SCA" },
    { type: "envelope_delivered", time: "6 hours ago", description: "Envelope AC12345 delivered to Sea Ports Corporation" },
    { type: "processing_delayed", time: "1 day ago", description: "Processing delayed for Ministry of Health documents" },
  ]
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'envelope_created': return <Package className="h-4 w-4 text-blue-500" />;
    case 'document_validated': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'envelope_delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'processing_delayed': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export function DashboardAnalytics({ onCompose, envelopes }: DashboardAnalyticsProps) {
  return (
    <div className="space-y-6">
      {/* Envelope Reminder */}
      <EnvelopeReminder onCompose={onCompose} />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-primary">Analytics Dashboard</h3>
          <p className="text-muted-foreground">Track your document transfer performance and insights</p>
        </div>
        <Button onClick={onCompose} variant="action">
          <Plus className="h-4 w-4 mr-2" />
          New Envelope
        </Button>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Envelopes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalEnvelopes}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.envelopesThisMonth}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.averageProcessingTime}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -15min improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.successRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Partners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Partners by Interaction
            </CardTitle>
            <CardDescription>Most frequent legal entity partnerships</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalytics.topPartners.map((partner, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.interactions} interactions</p>
                    </div>
                  </div>
                  <Badge variant={partner.change > 0 ? "default" : "secondary"} className="text-xs">
                    {partner.change > 0 ? '+' : ''}{partner.change}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Envelopes Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Envelopes</CardTitle>
          <CardDescription>Overview of your active document transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {envelopes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium text-muted-foreground mb-2">No envelopes yet</h4>
              <p className="text-sm text-muted-foreground mb-4">Create your first envelope to get started</p>
              <Button onClick={onCompose} variant="action">
                <Plus className="h-4 w-4 mr-2" />
                Create Envelope
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {envelopes.slice(0, 5).map((envelope) => (
                <div key={envelope.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">ACID: {envelope.acidNumber}</h4>
                      <Badge variant={envelope.status === 'sent' ? 'default' : envelope.status === 'under_review' ? 'secondary' : 'outline'}>
                        {envelope.status.charAt(0).toUpperCase() + envelope.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">To: {envelope.recipient}</p>
                    <p className="text-xs text-muted-foreground">
                      {envelope.files.length} document{envelope.files.length !== 1 ? 's' : ''} • {envelope.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {envelope.status === 'sent' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {envelope.status === 'under_review' && <Clock className="h-4 w-4 text-yellow-500" />}
                    {envelope.status === 'sent' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                  </div>
                </div>
              ))}
              {envelopes.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  And {envelopes.length - 5} more envelopes...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}