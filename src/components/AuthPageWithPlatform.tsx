import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, Building2 } from "lucide-react";
import { PrimesayLogo } from "./PrimesayLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthPageWithPlatformProps {
  platform: 'user' | 'legal_entity';
  onSuccess: () => void;
  onBack: () => void;
  onPlatformChange: (platform: 'user' | 'legal_entity') => void;
}

export function AuthPageWithPlatform({ platform, onSuccess, onBack, onPlatformChange }: AuthPageWithPlatformProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const platformConfig = {
    user: {
      title: "User Platform",
      description: "Sign in to access document management tools",
      icon: Package,
      color: "bg-blue-500",
      testEmail: "test.user@company.com"
    },
    legal_entity: {
      title: "Legal Entity Portal",
      description: "Sign in to access document verification tools",
      icon: Building2,
      color: "bg-green-500",
      testEmail: "customs@sudan.com"
    }
  };

  const config = platformConfig[platform];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            platform: platform
          }
        }
      });

      if (error) throw error;
      
      toast.success("Check your email for verification link");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Signed in successfully");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail(config.testEmail);
    setPassword("123456");
  };

  const handleToggle = (checked: boolean) => {
    const newPlatform = checked ? 'legal_entity' : 'user';
    onPlatformChange(newPlatform);
    // Clear form when switching platforms
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <PrimesayLogo className="h-12 w-12" />
          </div>
          
          {/* Platform Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Label htmlFor="platform-toggle" className={`text-sm font-medium transition-colors ${platform === 'user' ? 'text-primary' : 'text-muted-foreground'}`}>
              User Platform
            </Label>
            <Switch
              id="platform-toggle"
              checked={platform === 'legal_entity'}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="platform-toggle" className={`text-sm font-medium transition-colors ${platform === 'legal_entity' ? 'text-primary' : 'text-muted-foreground'}`}>
              Legal Entity Portal
            </Label>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <div className={`p-2 rounded-lg ${config.color} text-white`}>
              <config.icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <CardTitle className="text-xl font-bold">{config.title}</CardTitle>
              <CardDescription className="text-sm">{config.description}</CardDescription>
            </div>
          </div>

        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className={`grid w-full ${platform === 'legal_entity' ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              {platform === 'user' && <TabsTrigger value="signup">Sign Up</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            {platform === 'user' && (
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            )}
          </Tabs>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Demo Access</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={handleDemoLogin}
            >
              Try Demo Account
            </Button>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Demo Email:</span>
                <code className="text-primary">{config.testEmail}</code>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Password:</span>
                <code className="text-primary">123456</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}