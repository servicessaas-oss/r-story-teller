import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Building2, Mail, Phone, MapPin, Calendar, Edit, Save, ArrowLeft } from "lucide-react";

interface UserProfileProps {
  onBack: () => void;
}

export function UserProfile({ onBack }: UserProfileProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary">Company Profile</h2>
          <p className="text-muted-foreground">Manage your company information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg" alt="Company Logo" />
                <AvatarFallback className="text-2xl">PC</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>Primesay Cargo Ltd.</CardTitle>
            <CardDescription>Logistics & Import/Export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="default" className="mb-2">Verified Company</Badge>
              <p className="text-sm text-muted-foreground">Member since January 2024</p>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>License: PC-2024-001</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>john.doe@primesay.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+249 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Khartoum, Sudan</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Company Information
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value="Primesay Cargo Ltd." readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Input id="businessType" value="Logistics & Import/Export" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input id="registrationNumber" value="RC-2024-PC-001" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input id="taxId" value="TX-987654321" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedDate">Established Date</Label>
                <Input id="establishedDate" value="2020-03-15" type="date" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input id="employeeCount" value="25-50" readOnly />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryEmail">Primary Email</Label>
                  <Input id="primaryEmail" value="john.doe@primesay.com" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" value="+249 123 456 7890" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value="www.primesay-cargo.com" readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax">Fax</Label>
                  <Input id="fax" value="+249 123 456 7891" readOnly />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea 
                  id="address" 
                  value="Building 123, Street 45, Al-Riyadh District, Khartoum, Sudan, 11111" 
                  readOnly 
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Business Description</h3>
              <Textarea 
                value="Primesay Cargo Ltd. is a leading logistics and cargo handling company based in Sudan, specializing in import/export operations, customs clearance, and freight forwarding. We provide comprehensive logistics solutions including document management, cargo tracking, and compliance services for international trade." 
                readOnly 
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Business Statistics</CardTitle>
          <CardDescription>Your company performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">156</div>
              <p className="text-sm text-muted-foreground">Total Envelopes</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">18</div>
              <p className="text-sm text-muted-foreground">Legal Partners</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">94.2%</div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">2.4h</div>
              <p className="text-sm text-muted-foreground">Avg. Processing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}