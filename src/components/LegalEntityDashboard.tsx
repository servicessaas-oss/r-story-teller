import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Users,
  Building2
} from "lucide-react";

interface EnvelopeStats {
  pending: number;
  reviewed: number;
  approved: number;
  rejected: number;
  overdue: number;
}

interface LegalEntityDashboardProps {
  stats: EnvelopeStats;
  onNavigateToInbox: () => void;
  onNavigateToVerification: () => void;
  onNavigateToReports: () => void;
}

export function LegalEntityDashboard({ 
  stats, 
  onNavigateToInbox, 
  onNavigateToVerification,
  onNavigateToReports 
}: LegalEntityDashboardProps) {
  const totalDocuments = stats.pending + stats.reviewed + stats.approved + stats.rejected;
  const completionRate = totalDocuments > 0 ? Math.round(((stats.approved + stats.rejected) / totalDocuments) * 100) : 0;

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary">Dashboard Overview</h2>
          <p className="text-muted-foreground">Track your document review progress and performance</p>
        </div>
        <Button onClick={onNavigateToInbox} variant="default">
          <FileText className="h-4 w-4 mr-2" />
          Review Documents
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdue > 0 && (
                <span className="text-red-500 font-medium">{stats.overdue} overdue</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewed}</div>
            <p className="text-xs text-muted-foreground">In verification process</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToInbox}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Document Inbox
            </CardTitle>
            <CardDescription>
              Review pending documents and make decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stats.pending} documents waiting
              </span>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {stats.overdue} overdue
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToVerification}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5 text-primary" />
              Verification Workspace
            </CardTitle>
            <CardDescription>
              Advanced document verification and e-signature tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stats.reviewed} in progress
              </span>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onNavigateToReports}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Performance Reports
            </CardTitle>
            <CardDescription>
              View processing metrics and SLA compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {completionRate}% completion rate
              </span>
              <Badge variant="default" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                On track
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest document processing activities</CardDescription>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto">
          <div className="space-y-3">
            {[
              { action: "Approved", acid: "AC12345", time: "2 minutes ago", type: "Certificate of Origin" },
              { action: "Requested amendments", acid: "AC12346", time: "15 minutes ago", type: "Bill of Lading" },
              { action: "Signed", acid: "AC12347", time: "1 hour ago", type: "Commercial Invoice" },
              { action: "Under review", acid: "AC12348", time: "2 hours ago", type: "Packing List" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'Approved' ? 'bg-green-500' :
                    activity.action === 'Signed' ? 'bg-blue-500' :
                    activity.action === 'Requested amendments' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{activity.action} • ACID: {activity.acid}</p>
                    <p className="text-xs text-muted-foreground">{activity.type}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}