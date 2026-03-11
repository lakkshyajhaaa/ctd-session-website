"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-lg">{session?.user?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{session?.user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <Badge>{session?.user?.role}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
