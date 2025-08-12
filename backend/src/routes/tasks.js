// src/routes/tasks.js
const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// ต้องมี JWT ทุก endpoint
router.use(auth);


router.get('/dates', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT due_date,
              COUNT(*) AS total,
              SUM(CASE WHEN is_done = 1 THEN 1 ELSE 0 END) AS done_count
       FROM tasks
       WHERE user_id = :uid
       GROUP BY due_date
       ORDER BY due_date DESC`,
      { uid: req.user.id }
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks?date=YYYY-MM-DD (ดึงงานของวันนั้น)
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date (YYYY-MM-DD) required' });

    const [rows] = await pool.query(
      `SELECT id, title, notes, due_date, due_time, is_done, created_at, updated_at
       FROM tasks
       WHERE user_id = :uid AND due_date = :date
       ORDER BY COALESCE(due_time, '23:59:59'), id`,
      { uid: req.user.id, date }
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks (เพิ่มงาน)
router.post('/', async (req, res) => {
  try {
    const { title, notes, due_date, due_time } = req.body;
    if (!title || !due_date) {
      return res.status(400).json({ message: 'title and due_date required' });
    }
    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, title, notes, due_date, due_time)
       VALUES (:uid, :title, :notes, :due_date, :due_time)`,
      { uid: req.user.id, title, notes: notes || null, due_date, due_time: due_time || null }
    );
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = :id', { id: result.insertId });
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id (แก้ไขงาน: หัวข้อ/โน้ต/วันที่/เวลา/สถานะ)
router.put('/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    const { title, notes, due_date, due_time, is_done } = req.body;

    const [r] = await pool.query(
      `UPDATE tasks SET
         title = COALESCE(:title, title),
         notes = :notes,
         due_date = COALESCE(:due_date, due_date),
         due_time = :due_time,
         is_done = COALESCE(:is_done, is_done)
       WHERE id = :id AND user_id = :uid`,
      {
        id, uid: req.user.id,
        title: title ?? null,
        notes: notes ?? null,
        due_date: due_date ?? null,
        due_time: due_time ?? null,
        is_done: typeof is_done === 'boolean' ? (is_done ? 1 : 0) : null
      }
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Task not found' });

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = :id', { id });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/tasks/:id/toggle (สลับสถานะเสร็จ/ไม่เสร็จ)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const id = +req.params.id;
    const [rows] = await pool.query(
      'SELECT is_done FROM tasks WHERE id = :id AND user_id = :uid',
      { id, uid: req.user.id }
    );
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });

    const next = rows[0].is_done ? 0 : 1;
    await pool.query(
      'UPDATE tasks SET is_done = :next WHERE id = :id AND user_id = :uid',
      { next, id, uid: req.user.id }
    );
    return res.json({ id, is_done: !!next });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id (ลบงาน)
router.delete('/:id', async (req, res) => {
  try {
    const id = +req.params.id;
    const [r] = await pool.query(
      'DELETE FROM tasks WHERE id = :id AND user_id = :uid',
      { id, uid: req.user.id }
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Task not found' });
    return res.json({ message: 'Deleted', id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
