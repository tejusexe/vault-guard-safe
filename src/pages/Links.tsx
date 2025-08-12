import React, { useMemo, useState } from "react";
import { useVault } from "@/context/VaultContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchBar from "@/components/SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Folder } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { uuid } from "@/lib/crypto";

const Links: React.FC = () => {
  const { data, saveData } = useVault();
  const [query, setQuery] = useState("");
  const [newName, setNewName] = useState("");

  const categories = data?.links.categories ?? [];
  const filtered = useMemo(() => categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())), [categories, query]);

  const addCategory = async () => {
    const name = newName.trim();
    if (!name) return;
    await saveData(prev => ({
      ...prev,
      links: { categories: [...prev.links.categories, { id: uuid(), name, items: [] }] }
    }));
    setNewName("");
  };

  const deleteCategory = async (id: string) => {
    await saveData(prev => ({
      ...prev,
      links: { categories: prev.links.categories.filter(c => c.id !== id) }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <SearchBar placeholder="Search categories" value={query} onChange={setQuery} />
        <div className="flex items-center gap-2">
          <Input placeholder="New category" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button onClick={addCategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cat => (
          <Card key={cat.id} className="group">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Folder className="h-4 w-4 text-primary" />{cat.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <RouterLink to={`/links/${cat.id}`}>Open</RouterLink>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteCategory(cat.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {cat.items.length} items
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Links;
