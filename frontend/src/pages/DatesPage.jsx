// client/src/pages/DatesPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';


export default function DatesPage() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expanded, setExpanded] = useState({});
  const [dateTasks, setDateTasks] = useState({});
  const [loadingDate, setLoadingDate] = useState({});

  // บังคับวันที่ให้อยู่ในรูปแบบ 'yyyy-MM-dd'
  const toDateKey = (s) => {
    try {
      const d = parseISO(s);
      return format(d, 'yyyy-MM-dd');
    } catch {
      return s;
    }
  };

  const fetchDates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks/dates');
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDates(); }, []);

  // จัดกลุ่มตามเดือน-ปี
  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of summary) {
      const d = parseISO(r.due_date);
      const key = format(d, 'MMMM yyyy');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    }
    return map;
  }, [summary]);

  const toggleDay = async (rawDate) => {
    const dateKey = toDateKey(rawDate);
    const next = !expanded[dateKey];
    setExpanded(prev => ({ ...prev, [dateKey]: next }));

    if (next && !dateTasks[dateKey]) {
      setLoadingDate(prev => ({ ...prev, [dateKey]: true }));
      try {
        const { data } = await api.get('/tasks', { params: { date: dateKey } });
        setDateTasks(prev => ({ ...prev, [dateKey]: data }));
      } finally {
        setLoadingDate(prev => ({ ...prev, [dateKey]: false }));
      }
    }
  };

  const toggleTaskDone = async (rawDate, id) => {
    const dateKey = toDateKey(rawDate);
    await api.patch(`/tasks/${id}/toggle`);

    // อัปเดตรายการในแคช
    setDateTasks(prev => {
      const list = (prev[dateKey] || []).map(t => t.id === id ? { ...t, is_done: t.is_done ? 0 : 1 } : t);
      return { ...prev, [dateKey]: list };
    });

    // อัปเดตตัวเลขสรุป
    setSummary(prev =>
      prev.map(s => {
        const sKey = toDateKey(s.due_date);
        if (sKey !== dateKey) return s;
        const wasDone = (dateTasks[dateKey] || []).find(t => t.id === id)?.is_done ? 1 : 0;
        return { ...s, done_count: s.done_count + (wasDone ? -1 : +1) };
      })
    );
  };

  return (
    <div className="container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>วันที่ที่มีรายการ</h2>
        <ThemeToggle />
        <a href="/" className="link-btn">กลับไปหน้าหลัก</a>
      </div>

      {loading ? <p>กำลังโหลด...</p> : (
        [...grouped.entries()].map(([monthLabel, rows]) => (
          <div key={monthLabel} style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>{monthLabel}</h3>
            <ul>
              {rows
                .sort((a, b) => (a.due_date < b.due_date ? 1 : -1))
                .map(r => {
                  const dObj = parseISO(r.due_date);
                  const label = format(dObj, 'EEE dd/MM/yyyy');
                  const remain = r.total - r.done_count;
                  const dateKey = toDateKey(r.due_date);
                  const isOpen = !!expanded[dateKey];
                  const isLoadingDay = !!loadingDate[dateKey];
                  const tasks = dateTasks[dateKey] || [];

                  return (
                    <li key={dateKey} className="date-item">
                      <div
                        onClick={() => toggleDay(r.due_date)}
                        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', userSelect:'none' }}
                      >
                        <div>
                          <span style={{ marginRight: 8 }}>{isOpen ? '▼' : '▶'}</span>
                          {label}
                        </div>
                        <div>
                          <small>ทั้งหมด {r.total} • เสร็จ {r.done_count} • ค้าง {remain}</small>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: 8, paddingLeft: 24 }}>
                          {isLoadingDay ? (
                            <p>กำลังโหลดรายการ...</p>
                          ) : tasks.length ? (
                            <ul>
                              {tasks.map(t => (
                                <li key={t.id} style={{
                                  display:'grid',
                                  gridTemplateColumns:'auto 1fr auto',
                                  gap:8, alignItems:'center',
                                  padding:'6px 0', borderBottom:'1px dashed #333'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={!!t.is_done}
                                    onChange={() => toggleTaskDone(dateKey, t.id)}
                                    title="ติ้กเพื่อสลับสถานะ"
                                  />
                                  <div>
                                    <div className={`task-title ${t.is_done ? 'done' : ''}`}>
                                      {t.title} {t.due_time ? <small>({t.due_time.slice(0,5)})</small> : null}
                                    </div>
                                    {t.notes ? <small className="task-notes">{t.notes}</small> : null}
                                  </div>
                                  <a href={`/?date=${dateKey}`} className="link-btn">เปิดใน Dashboard</a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ opacity:.7 }}>— ไม่มีรายการ —</p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        ))
      )}

      {!loading && summary.length === 0 && <p>ยังไม่มีวันที่ที่มีรายการ</p>}
    </div>
  );
}
