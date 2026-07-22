"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/wedding/status-badge";
import { StickyActionBar } from "@/components/wedding/sticky-action-bar";
import { Plus, Trash, Save } from "lucide-react";

interface Task {
  id: string;
  title: string;
  dueDate?: string | null;
  status: string;
  assignedTo?: { name: string } | null;
}

interface Member {
  user: {
    id: string;
    name: string;
  };
}

export default function ChecklistPage() {
  const params = useParams();
  const weddingId = params.weddingId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("SEMUA");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssigned, setTaskAssigned] = useState("");

  const fetchData = useCallback(async () => {
    const [tRes, mRes] = await Promise.all([
      fetch(`/api/wedding/${weddingId}/tasks`),
      fetch(`/api/wedding/${weddingId}/members`),
    ]);
    const tData = await tRes.json();
    const mData = await mRes.json();
    if (Array.isArray(tData)) setTasks(tData);
    if (Array.isArray(mData)) setMembers(mData);
    setLoading(false);
  }, [weddingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveTask = async () => {
    const res = await fetch(`/api/wedding/${weddingId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        dueDate: taskDueDate || undefined,
        assignedToId: taskAssigned !== "none" ? taskAssigned : undefined,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks([...tasks, created]);
    }
    setDialogOpen(false);
  };

  const toggleTask = async (taskId: string, isDone: boolean) => {
    const status = isDone ? "SELESAI" : "BELUM";
    const res = await fetch(`/api/wedding/${weddingId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    }
  };

  const deleteTask = async (taskId: string) => {
    const res = await fetch(`/api/wedding/${weddingId}/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const completedCount = tasks.filter((t) => t.status === "SELESAI").length;
  const progressVal = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const filteredTasks = tasks
    .filter((t) => {
      if (filter === "SEMUA") return true;
      if (filter === "BELUM") return t.status === "BELUM";
      if (filter === "SEDANG") return t.status === "SEDANG_BERJALAN";
      if (filter === "SELESAI") return t.status === "SELESAI";
      return true;
    })
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        Memuat...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Checklist Persiapan</h2>
        <Button
          className="hidden md:flex"
          onClick={() => {
            setTaskTitle("");
            setTaskDueDate("");
            setTaskAssigned("none");
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Task
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span>Progress</span>
          <span>
            {completedCount} / {tasks.length} selesai
          </span>
        </div>
        <Progress value={progressVal} />
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="SEMUA">Semua</TabsTrigger>
          <TabsTrigger value="BELUM">Belum</TabsTrigger>
          <TabsTrigger value="SEDANG">Sedang</TabsTrigger>
          <TabsTrigger value="SELESAI">Selesai</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada tugas di kategori ini.
          </p>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 border-b border-border py-3 px-2 hover:bg-muted/50"
            >
              <Checkbox
                checked={t.status === "SELESAI"}
                onCheckedChange={(c) => toggleTask(t.id, !!c)}
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`block text-sm font-medium ${
                    t.status === "SELESAI"
                      ? "line-through text-muted-foreground"
                      : ""
                  }`}
                >
                  {t.title}
                </span>
                <span className="text-xs text-muted-foreground block">
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString("id-ID")
                    : "Tanpa tenggat waktu"}
                  {t.assignedTo && ` • ${t.assignedTo.name}`}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {t.status === "SELESAI" && <StatusBadge variant="lunas" label="Selesai" />}
                {t.status === "SEDANG_BERJALAN" && <StatusBadge variant="sedang" label="Sedang" />}
                {t.status === "BELUM" && <StatusBadge variant="belum" label="Belum" />}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Task ini akan dihapus permanen. Lanjutkan?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTask(t.id)}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="md:hidden">
        <StickyActionBar>
          <Button
            className="w-full"
            onClick={() => {
              setTaskTitle("");
              setTaskDueDate("");
              setTaskAssigned("none");
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Task
          </Button>
        </StickyActionBar>
      </div>

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Tambah Task</SheetTitle>
            <SheetDescription>Masukkan detail task baru.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tTitle">Judul Task</Label>
                <Input
                  id="tTitle"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tDue">Tenggat Waktu</Label>
                <Input
                  id="tDue"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Ditugaskan Kepada</Label>
                <Select value={taskAssigned} onValueChange={setTaskAssigned}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih anggota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-card border-t border-border p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
            <Button size="lg" className="w-full h-11" onClick={saveTask} disabled={!taskTitle.trim()}>
              <Save className="mr-2 h-4 w-4" /> Simpan
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
