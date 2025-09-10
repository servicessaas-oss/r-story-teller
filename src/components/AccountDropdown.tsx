import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Building2, Shield, Globe, ChevronDown } from "lucide-react";

interface AccountDropdownProps {
  userName: string;
  userEmail: string;
  companyName: string;
  userRole: string;
  profileImage?: string;
  notificationCount?: number;
  onProfile: () => void;
  onSettings: () => void;
  onSignOut: () => void;
}

export function AccountDropdown({
  userName,
  userEmail,
  companyName, 
  userRole,
  profileImage,
  notificationCount = 0,
  onProfile,
  onSettings,
  onSignOut
}: AccountDropdownProps) {
  const initials = userName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-3 px-3 py-2 h-auto">
          <div className="relative">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
              <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
            </Avatar>
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs border-2 border-background"
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground mt-1">{companyName}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-popover border-border z-[60]" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profileImage || "/placeholder.svg"} alt={userName} />
              <AvatarFallback className="text-base font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-base font-medium leading-none">{userName}</p>
              <p className="text-sm text-muted-foreground mt-1">{userEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{companyName}</span>
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfile} className="p-3">
          <User className="mr-3 h-4 w-4" />
          <div>
            <p className="font-medium">Profile</p>
            <p className="text-xs text-muted-foreground">View and edit your profile</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettings} className="p-3">
          <Settings className="mr-3 h-4 w-4" />
          <div>
            <p className="font-medium">Settings</p>
            <p className="text-xs text-muted-foreground">Preferences and security</p>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="p-3 text-destructive focus:text-destructive">
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}