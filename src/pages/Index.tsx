import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { KeyRound, Link2 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-[60vh] grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/accounts" className="block">
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" /> Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            Manage categories of usernames and passwords. Copy quickly when needed.
          </CardContent>
        </Card>
      </Link>

      <Link to="/links" className="block">
        <Card className="h-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-6 w-6 text-primary" /> Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            Organize website and video links by category for quick access.
          </CardContent>
        </Card>
      </Link>

      <div className="md:col-span-2 flex items-center justify-center mt-4">
        <Button asChild variant="outline">
          <a href="/" aria-label="Secure Vault home">Secure and local — AES-GCM encrypted</a>
        </Button>
      </div>
    </div>
  );
};

export default Index;
