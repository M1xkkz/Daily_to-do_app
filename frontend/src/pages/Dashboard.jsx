// client/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // ใช้ query string: /?date=YYYY-MM-DD
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDate = searchParams.get("date") || format(new Date(), "yyyy-MM-dd");

  const [date, setDate] = useState(initialDate);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", notes: "", due_time: "" });
  const [loading, setLoading] = useState(false);

  // inline edit
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", notes: "", due_time: "" });

  // === NEW: sidebar state (มือถือ) ===
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks", { params: { date } });
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(); // eslint-disable-next-line
  }, [date]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    await api.post("/tasks", {
      ...form,
      due_date: date,
      due_time: form.due_time || null,
    });
    setForm({ title: "", notes: "", due_time: "" });
    fetchTasks();
  };

  const toggleTask = async (id) => {
    await api.patch(`/tasks/${id}/toggle`);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm("ลบงานนี้?")) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setEditForm({
      title: t.title || "",
      notes: t.notes || "",
      due_time: t.due_time ? t.due_time.slice(0, 5) : "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ title: "", notes: "", due_time: "" });
  };

  const saveEdit = async (id) => {
    await api.put(`/tasks/${id}`, {
      title: editForm.title,
      notes: editForm.notes,
      due_time: editForm.due_time || null,
    });
    cancelEdit();
    fetchTasks();
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h2>สวัสดี {user?.display_name}</h2>

        {/* ปุ่มบนเดสก์ท็อป (ถูกซ่อนอัตโนมัติเมื่อ ≤480px ผ่าน CSS .header-actions) */}
        <div className="header-actions">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
  <ThemeToggle />
</div>
          <Link to="/dates" className="link-btn">ดูวันทั้งหมดที่มีรายการ</Link>
          <button onClick={logout}>ออกจากระบบ</button>
          
        </div>

        {/* Hamburger (โชว์เมื่อ ≤480px ผ่าน CSS .hamburger) */}
        <button
          className="hamburger"
          aria-label="เมนู"
          title="เมนู"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* ===== Sidebar (สำหรับมือถือ) ===== */}
      <div
        className={`sidebar-overlay ${menuOpen ? "show" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`sidebar ${menuOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="side-title">เมนู</div>
        <div className="side-actions">
        <ThemeToggle />
          <Link to="/dates" className="link-btn" onClick={() => setMenuOpen(false)}>
            ดูวันทั้งหมดที่มีรายการ
          </Link>
          
          <button
            onClick={() => {
              setMenuOpen(false);
              logout();
            }}
          >
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Date picker */}
      <div style={{ margin: "12px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <div>
          <label>เลือกวันที่: </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              const d = e.target.value;
              setDate(d);
              setSearchParams(d ? { date: d } : {});
            }}
          />
        </div>
      </div>

      {/* เพิ่มงานใหม่ */}
      <form
        onSubmit={addTask}
        style={{ display: "grid", gap: 8, gridTemplateColumns: "2fr 2fr 1fr auto" }}
      >
        <input
          placeholder="สิ่งที่ต้องทำ"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="โน้ต (ถ้ามี)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <input
          type="time"
          value={form.due_time}
          onChange={(e) => setForm({ ...form, due_time: e.target.value })}
        />
        <button type="submit">เพิ่ม</button>
      </form>

      {/* รายการงาน + แก้ไข inline */}
      {loading ? (
        <p>กำลังโหลด...</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
          {tasks.map((t) => {
            const isEditing = editId === t.id;
            return (
              <li key={t.id} className="task-item">
                {/* เสร็จ/ไม่เสร็จ */}
                <input
                  type="checkbox"
                  checked={!!t.is_done}
                  onChange={() => toggleTask(t.id)}
                  title="ติ้กเพื่อสลับสถานะ"
                />

                {/* หัวข้อ */}
                {isEditing ? (
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="หัวข้อ"
                  />
                ) : (
                  <div className={`task-title ${t.is_done ? "done" : ""}`}>
                    {t.title}
                  </div>
                )}

                {/* โน้ต */}
                {isEditing ? (
                  <input
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="โน้ต"
                  />
                ) : (
                  <div className="task-notes">
                    {t.notes || <span style={{ opacity: 0.5 }}>ไม่มี Notes</span>}
                  </div>
                )}

                {/* เวลา */}
                {isEditing ? (
                  <input
                    type="time"
                    value={editForm.due_time}
                    onChange={(e) => setEditForm({ ...editForm, due_time: e.target.value })}
                  />
                ) : (
                  <div>
                    {t.due_time ? t.due_time.slice(0, 5) : <span style={{ opacity: 0.5 }}>ไม่ระบุเวลา</span>}
                  </div>
                )}

                {/* ปุ่มแอคชัน */}
                {isEditing ? (
                  <>
                    <button onClick={() => saveEdit(t.id)}>บันทึก</button>
                    <button onClick={cancelEdit}>ยกเลิก</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(t)}>แก้ไข</button>
                    <button onClick={() => deleteTask(t.id)}>❌</button>
                  </>
                )}
              </li>
            );
          })}
          {!tasks.length && <p>ยังไม่มีงานสำหรับวันนี้</p>}
        </ul>
      )}
    </div>
  );
}
