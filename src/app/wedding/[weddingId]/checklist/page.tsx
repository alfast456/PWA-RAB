"use client";

import { useState, useEffect } from "react";

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

export default function ChecklistPage({ params }: { params: { weddingId: string } }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", dueDate: "", assignedToId: "" });
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetch(`/api/wedding/${params.weddingId}/members`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      });

    fetch(`/api/wedding/${params.weddingId}/tasks${filterStatus ? `?status=${filterStatus}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
      })
      .finally(() => setLoading(false));
  }, [params.weddingId, filterStatus]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/wedding/${params.weddingId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTask.title,
        dueDate: newTask.dueDate || undefined,
        assignedToId: newTask.assignedToId || undefined,
      }),
    });
    if (res.ok) {
      const task = await res.json();
      setTasks([...tasks, task]);
      setNewTask({ title: "", dueDate: "", assignedToId: "" });
      setShowAddTask(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const res = await fetch(`/api/wedding/${params.weddingId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    }
  };

  const completedCount = tasks.filter((t) => t.status === "SELESAI").length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Checklist Persiapan</h2>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
        >
          Tambah Task
        </button>
      </div>

      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Progress</span>
          <span className="text-sm text-gray-600">{completedCount} / {tasks.length} selesai</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div className="bg-black h-4 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Semua Status</option>
          <option value="BELUM">Belum</option>
          <option value="SEDANG_BERJALAN">Sedang Berjalan</option>
          <option value="SELESAI">Selesai</option>
        </select>
      </div>

      {showAddTask && (
        <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Judul task"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2"
              required
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            <select
              value={newTask.assignedToId}
              onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Pilih member</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800">
              Simpan
            </button>
        </form>
      )}

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div className="space-y-2">
          {tasks
            .sort((a, b) => {
              if (!a.dueDate) return 1;
              if (!b.dueDate) return -1;
              return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            })
            .map((task) => (
              <div key={task.id} className="rounded-lg border p-4 flex items-center justify-between">
                <div>
                  <div className={`font-medium ${task.status === "SELESAI" ? "line-through text-gray-500" : ""}`}>
                    {task.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID") : "No deadline"}
                    {task.assignedTo && ` • ${task.assignedTo.name}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                  >
                    <option value="BELUM">Belum</option>
                    <option value="SEDANG_BERJALAN">Sedang Berjalan</option>
                    <option value="SELESAI">Selesai</option>
                  </select>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
