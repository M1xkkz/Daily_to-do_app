// client/src/pages/RegisterPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';


export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', display_name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 style={{ margin: '32px 0 16px' ,display:'flex', justifyContent:'center'}}>สมัครสมาชิก</h2>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          placeholder="ชื่อที่แสดง"
          value={form.display_name}
          onChange={e => setForm({ ...form, display_name: e.target.value })}
        />
        <input
          placeholder="อีเมล"
          type="email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="รหัสผ่าน"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">สมัคร</button>
      </form>

      {error && <p style={{ color: '#ff6b6b', marginTop: 10 }}>{error}</p>}

      <p style={{ marginTop: 16 }}>
        มีบัญชีแล้ว? <a href="/login" className="link-btn" style={{ marginLeft: 6 }}>เข้าสู่ระบบ</a>
      </p>
    </div>
  );
}
