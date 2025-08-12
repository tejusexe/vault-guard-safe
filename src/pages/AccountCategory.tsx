import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useVault, AccountItem } from "@/context/VaultContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Plus, Trash2 } from "lucide-react";
import { uuid } from "@/lib/crypto";
import { toast } from "sonner";

const AccountCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, saveData } = useVault();
  const category = useMemo(() => data?.accounts.categories.find(c => c.id === id), [data, id]);

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!category) return <div>Category not found</div>;

  const addItem = async () => {
    if (!title || !username || !password) return;
    const item: AccountItem = { id: uuid(), title, username, password };
    await saveData(prev => ({
      ...prev,
      accounts: {
        categories: prev.accounts.categories.map(c => c.id === category.id ? { ...c, items: [...c.items, item] } : c)
      }
    }));
    setTitle(""); setUsername(""); setPassword("");
  };

  const deleteItem = async (itemId: string) => {
    await saveData(prev => ({
      ...prev,
      accounts: {
        categories: prev.accounts.categories.map(c => c.id === category.id ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c)
      }
    }));
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{category.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add item</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={addItem}><Plus className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {category.items.map(item => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copy(item.username, "Username")}>
                  <Copy className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline">Copy username</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => copy(item.password, "Password")}>
                  <Copy className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline">Copy password</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Username: <span className="text-foreground">{item.username}</span></div>
              <div className="text-muted-foreground">Password: <span className="text-foreground">••••••••</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountCategory;
