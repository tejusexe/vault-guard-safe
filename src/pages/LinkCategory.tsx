import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useVault, LinkItem } from "@/context/VaultContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Plus, Trash2, ExternalLink } from "lucide-react";
import { uuid } from "@/lib/crypto";
import { toast } from "sonner";

const LinkCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, saveData } = useVault();
  const category = useMemo(() => data?.links.categories.find(c => c.id === id), [data, id]);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  if (!category) return <div>Category not found</div>;

  const addItem = async () => {
    if (!title || !url) return;
    const item: LinkItem = { id: uuid(), title, url };
    await saveData(prev => ({
      ...prev,
      links: {
        categories: prev.links.categories.map(c => c.id === category.id ? { ...c, items: [...c.items, item] } : c)
      }
    }));
    setTitle(""); setUrl("");
  };

  const deleteItem = async (itemId: string) => {
    await saveData(prev => ({
      ...prev,
      links: {
        categories: prev.links.categories.map(c => c.id === category.id ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c)
      }
    }));
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{category.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add link</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button onClick={addItem}><Plus className="h-4 w-4" /></Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {category.items.map(item => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{item.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copy(item.url)}>
                  <Copy className="h-4 w-4" />
                  <span className="ml-2 hidden md:inline">Copy link</span>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="ml-2 hidden md:inline">Open</span>
                  </a>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LinkCategory;
