// client/src/pages/LoginPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';


export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true }); // ถ้ามี user แล้ว ให้เด้งไปหน้าแรก
  }, [user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true }); // สำเร็จแล้วเด้งไป Dashboard
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <h2 style={{ margin: '32px 0 16px', display:'flex', justifyContent:'center'}}>เข้าสู่ระบบ</h2>
      

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
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
        
        <button type="submit">เข้าสู่ระบบ</button>
        
      </form>

      {error && <p style={{ color: '#ff6b6b', marginTop: 10 }}>{error}</p>}

      <p style={{ marginTop: 16 }}>
        ยังไม่มีบัญชี? <a href="/register" className="link-btn" style={{ marginLeft: 6 }}>สมัครสมาชิก</a>
      </p>
    </div>
  );
}
