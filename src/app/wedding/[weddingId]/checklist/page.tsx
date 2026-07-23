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
import { Plus, Trash, Save, Pencil } from "lucide-react";

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssigned, setTaskAssigned] = useState("");
  const [taskStatus, setTaskStatus] = useState("BELUM");

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
    const payload = {
      title: taskTitle,
      dueDate: taskDueDate || undefined,
      assignedToId: taskAssigned !== "none" ? taskAssigned : undefined,
      status: taskStatus,
    };

    if (editingTask) {
      const res = await fetch(`/api/wedding/${weddingId}/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
      }
    } else {
      const res = await fetch(`/api/wedding/${weddingId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks([...tasks, created]);
      }
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

  const openAddTask = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDueDate("");
    setTaskAssigned("none");
    setTaskStatus("BELUM");
    setDialogOpen(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setTaskAssigned(task.assignedTo?.name ? (members.find(m => m.user.name === task.assignedTo!.name)?.user.id || "none") : "none");
    setTaskStatus(task.status);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-muted-foreground">
        Memuat...
      </div>
    );
  }

return (
    <div className="w-full max-w-5xl mx-auto px-4 xs:px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-4">
<div className="flex items-center justify-between">
          <h2 className="font-display text-2xl sm:text-xl">Checklist Persiapan</h2>
          <Button
            className="hidden md:flex sm:ml-4"
            onClick={openAddTask}
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Task
          </Button>
        </div>

      <div className="space-y-2 sm:space-y-4">
          <div className="flex items-center justify-between text-sm font-medium sm:flex">
            <span>Progress</span>
            <span className="flex items-center">
              <span>{completedCount}</span>
              <span className="mx-1"> / </span>
              <span>{tasks.length}</span>
              <span className="ml-1 text-sm text-muted-foreground"> selesai</span>
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-start">
            <Progress value={progressVal} className="w-full sm:w-64" />
          </div>
        </div>

      <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex w-full bg-transparent p-0 gap-1 sm:gap-2 overflow-x-auto no-scrollbar justify-start border-b border-border pb-px rounded-none">
            <TabsTrigger 
              value="SEMUA" 
              className="px-4 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"
            >
              Semua
            </TabsTrigger>
            <TabsTrigger 
              value="BELUM" 
              className="px-4 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"
            >
              Belum
            </TabsTrigger>
            <TabsTrigger 
              value="SEDANG" 
              className="px-4 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"
            >
              Sedang
            </TabsTrigger>
            <TabsTrigger 
              value="SELESAI" 
              className="px-4 py-2 bg-transparent text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none"
            >
              Selesai
            </TabsTrigger>
          </TabsList>
      </Tabs>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Tidak ada tugas di kategori ini.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 sm:py-3 px-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Checkbox
                    checked={t.status === "SELESAI"}
                    onCheckedChange={(c) => toggleTask(t.id, !!c)}
                    className="mt-0.5 sm:mt-0"
                  />
                  <div className="flex-1 min-w-0 sm:hidden">
                    <span
                      className={`block text-sm font-medium ${
                        t.status === "SELESAI"
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {t.title}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 hidden sm:block">
                  <span
                    className={`block text-sm font-medium ${
                      t.status === "SELESAI"
                        ? "line-through text-muted-foreground truncate"
                        : "truncate"
                    }`}
                  >
                    {t.title}
                  </span>
                  <span className="text-xs text-muted-foreground block truncate mt-0.5">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString("id-ID") : "Tanpa tenggat waktu"}
                    {t.assignedTo && ` • ${t.assignedTo.name}`}
                  </span>
                </div>
                
                {/* Mobile view metadata */}
                <div className="pl-7 sm:hidden w-full space-y-2">
                  <span className="text-xs text-muted-foreground block truncate">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString("id-ID") : "Tanpa tenggat waktu"}
                    {t.assignedTo && ` • ${t.assignedTo.name}`}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pl-7 sm:pl-0 w-full sm:w-auto shrink-0 mt-1 sm:mt-0">
                  <div className="flex gap-2">
                    {t.status === "SELESAI" && <StatusBadge variant="lunas" label="Selesai" />}
                    {t.status === "SEDANG_BERJALAN" && <StatusBadge variant="sedang" label="Sedang" />}
                    {t.status === "BELUM" && <StatusBadge variant="belum" label="Belum" />}
                  </div>
                  
                  <AlertDialog>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0" onClick={() => openEditTask(t)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0">
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
            ))}
          </div>
        )}
      </div>

      <div className="md:hidden">
        <StickyActionBar>
          <Button
            className="w-full"
            onClick={openAddTask}
          >
            <Plus className="w-4 h-4 mr-2" /> Tambah Task
          </Button>
        </StickyActionBar>
      </div>

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-lg flex flex-col p-0 w-full">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>{editingTask ? "Edit Task" : "Tambah Task"}</SheetTitle>
            <SheetDescription>
              {editingTask ? "Ubah detail task." : "Masukkan detail task baru."}
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                    <Label htmlFor="tTitle">Judul Task</Label>
                    <Input
                      id="tTitle"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full sm:w-3/4"
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
                      className="w-full sm:w-2/3"
                    />
                  </div>
              <div className="space-y-2">
                <Label>Ditugaskan Kepada</Label>
                <Select value={taskAssigned} onValueChange={setTaskAssigned}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih anggota" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={taskStatus} onValueChange={setTaskStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="BELUM">Belum</SelectItem>
                    <SelectItem value="SEDANG_BERJALAN">Sedang Dikerjakan</SelectItem>
                    <SelectItem value="SELESAI">Selesai</SelectItem>
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
