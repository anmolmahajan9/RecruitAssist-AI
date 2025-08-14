
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Trash2,
  Edit,
  Save,
  PlusCircle,
  X,
} from 'lucide-react';
import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
} from '@/services/clientService';
import type { Client } from '@/types/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClientManagerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClientsUpdate: () => void;
}

export function ClientManager({
  isOpen,
  onOpenChange,
  onClientsUpdate,
}: ClientManagerProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newClientName, setNewClientName] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingClientName, setEditingClientName] = useState('');

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const fetchedClients = await getClients();
      setClients(fetchedClients);
    } catch (e) {
      setError('Failed to fetch clients.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleAddClient = async () => {
    if (!newClientName.trim()) return;
    try {
      await addClient(newClientName.trim());
      setNewClientName('');
      fetchClients();
      onClientsUpdate();
    } catch (e) {
      setError('Failed to add client.');
    }
  };

  const handleUpdateClient = async (id: string) => {
    if (!editingClientName.trim()) return;
    try {
      await updateClient(id, editingClientName.trim());
      setEditingClientId(null);
      fetchClients();
      onClientsUpdate();
    } catch (e) {
      setError('Failed to update client.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (
      !window.confirm('Are you sure you want to delete this client?')
    ) {
      return;
    }
    try {
      await deleteClient(id);
      fetchClients();
      onClientsUpdate();
    } catch (e) {
      setError('Failed to delete client.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Manage Clients</DialogTitle>
          <DialogDescription>
            Add, edit, or delete client names.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden px-6">
          <ScrollArea className="h-full pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <ul className="space-y-2">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center gap-2 p-2 rounded-md border"
                  >
                    {editingClientId === client.id ? (
                      <>
                        <Input
                          value={editingClientName}
                          onChange={(e) =>
                            setEditingClientName(e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUpdateClient(client.id)}
                          className="h-8 w-8"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingClientId(null)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-grow font-medium">
                          {client.name}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingClientId(client.id);
                            setEditingClientName(client.name);
                          }}
                           className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteClient(client.id)}
                          className="h-8 w-8 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="p-6 pt-4 border-t">
          <div className="flex w-full items-center gap-2">
            <Input
              placeholder="New client name..."
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
              className="flex-grow"
            />
            <Button onClick={handleAddClient} disabled={!newClientName.trim()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
