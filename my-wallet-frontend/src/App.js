import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2, PlusCircle, Wallet, Search, Lock, Unlock } from 'lucide-react';


const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
};


function App() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem("role") || "user";
  });
  const [form, setForm] = useState({ paymentType: '', amount: '' });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const API_URL = 'https://web-demo-thu-chi-my-wallet-api.onrender.com';
  const ADMIN_KEY = 'my-secret-key-123'; // Khớp với Backend

  const fetchPayments = () => axios.get(API_URL).then(res => setPayments(res.data));
  useEffect(() => { fetchPayments(); }, []);

  const handleLogin = () => {
  if (isLoggedIn) {
    if (window.confirm("Bạn muốn đăng xuất?")) {
      setIsLoggedIn(false);
      setRole("user");
      //Xoa thông tin đăng nhập khỏi localStorage khi đăng xuất
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("role");
    }
  } else {
    const pass = prompt("Nhập mật khẩu (admin123 cho Admin, user123 cho Người dùng):");
    if (pass === "admin123") {
      setIsLoggedIn(true);
      setRole("admin");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", "admin");
      alert("Chào Admin! Bạn có toàn quyền.");
    } else if (pass === "user123") {
      setIsLoggedIn(true);
      setRole("user");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", "user");
      alert("Chào User! Bạn chỉ có quyền xem.");
    } else {
      alert("Sai mật khẩu!");
    }
  }
};


  // Tính toán các con số thống kê
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const avgAmount = payments.length > 0 ? totalAmount / payments.length : 0;
  const bigPayments = payments.filter(p => p.amount >= 1000000).length; // Giao dịch trên 1 triệu

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.paymentType || !form.amount) return alert("Vui lòng nhập đủ thông tin!");
    axios.post(API_URL, form)
      .then(() => { fetchPayments(); setForm({ paymentType: '', amount: '' }); })
      .catch(() => alert("Lỗi: Số tiền phải > 0"));
  };

  const handleDelete = (id) => {
    if (window.confirm("Xóa giao dịch này?")) {
      axios.delete(`${API_URL}/${id}`, { headers: { 'Admin-Key': ADMIN_KEY } })
        .then(() => fetchPayments())
        .catch(err => alert("Lỗi: Bạn không có quyền xóa!"));
    }
  };

  const handleDeleteAll = () => {
    // Bước 1: Cảnh báo nhẹ
    if (window.confirm("CẢNH BÁO: Bạn đang thực hiện xóa TOÀN BỘ dữ liệu. Tiếp tục?")) {
    
      // Bước 2: Yêu cầu mật khẩu xác nhận
      const confirmPass = prompt("Nhập mật khẩu Admin để xác nhận hành động này:");
    
      if (confirmPass === "admin123") { // Kiểm tra mật khẩu
        axios.delete(`${API_URL}/all`, { 
          headers: { 'Admin-Key': ADMIN_KEY } 
        })
        .then(() => {
          fetchPayments();
          alert("💥 Bùm! Toàn bộ dữ liệu đã được dọn sạch.");
        })
        .catch(err => alert("Lỗi: Không thể thực hiện lệnh xóa tổng lực."));
      } else {
        alert("Xác nhận thất bại! Mật khẩu không đúng.");
      }
    }
  };




  const filteredPayments = payments.filter(p => {
    const search = removeAccents(searchTerm.toLowerCase().replace(/\s+/g, '')); // Loại bỏ khoảng trắng để tìm kiếm linh hoạt hơn
    const type = removeAccents((p.paymentType || "").toLowerCase().replace(/\s+/g, ''));
    // Chuyển ngày tháng thành chuỗi để tìm kiếm
    const cat = removeAccents((p.category || "").toLowerCase().replace(/\s+/g, ''));
    const date = p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN').toLowerCase() : "";
  
    return type.includes(search) || cat.includes(search) || date.includes(search);
  });


  const total = payments.reduce((sum, p) => {
    return p.type === 'INCOME' ? sum + p.amount : sum - p.amount;
  }, 0);

  const exportCSV = () => {
  const csvRows = [
    ["ID", "Noi dung", "So tien", "Loai", "Ngay tao"], // Tiêu đề cột
    ...payments.map(p => [p.id, p.paymentType, p.amount, p.category, p.createdAt])
  ];
  
  const csvContent = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "vi-dien-tu.csv");
  link.click();
};

const getCategoryColor = (cat) => {
  switch(cat) {
    case 'Ăn uống': return { bg: '#fff5f5', text: '#e03131', border: '#ffc9c9' }; // Đỏ
    case 'Mua sắm': return { bg: '#f3f0ff', text: '#845ef7', border: '#d0bfff' }; // Tím
    case 'Lương': return { bg: '#ebfbee', text: '#2f9e44', border: '#b2f2bb' };   // Xanh lá
    default: return { bg: '#f8f9fa', text: '#495057', border: '#dee2e6' };        // Xám (Chung)
  }
};

const theme = {
  bg: darkMode ? '#1a1a1a' : '#f8f9fa',
  card: darkMode ? '#2d2d2d' : 'white',
  text: darkMode ? '#ffffff' : '#2c3e50',
  subText: darkMode ? '#a0a0a0' : '#95a5a6',
  inputBg: darkMode ? '#3d3d3d' : 'white',
  border: darkMode ? '#444' : '#eee'
};


  return (
    <div style={{ 
      backgroundColor: theme.bg, // Màu nền thay đổi theo chế độ
      minHeight: '100vh', 
      transition: 'all 0.3s ease', // Hiệu ứng đổi màu mượt mà
      padding: '20px' 
    }}>
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px', 
        fontFamily: 'Arial',
        color: theme.text 
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <Wallet color="#2ecc71" size={32} /> Ví Của Tôi
          </h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => {
              const newDarkMode = !darkMode;
              setDarkMode(newDarkMode);
              localStorage.setItem("darkMode", JSON.stringify(newDarkMode)); // Lưu trạng thái dark mode vào localStorage
            }} 
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogin} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              {role === 'admin' ? <Unlock color="#2ecc71" /> : <Lock color={theme.subText} />}
            </button>
          </div>
        </div>

        {/* Tổng số dư - Giữ màu xanh lá làm điểm nhấn */}
        <div style={{ background: '#2ecc71', color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(46, 204, 113, 0.3)' }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>Tổng số dư hiện tại:</p>
          <h2 style={{ margin: 0, fontSize: '2.2rem' }}>{total.toLocaleString()} ₫</h2>
        </div>

        {/* Thống kê nhanh */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: theme.card, padding: '12px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '0.75rem', color: theme.subText }}>Trung bình/lần</span>
            <div style={{ fontWeight: 'bold' }}>{Math.round(avgAmount).toLocaleString()} ₫</div>
          </div>
          <div style={{ background: theme.card, padding: '12px', borderRadius: '10px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '0.75rem', color: theme.subText }}>Giao dịch lớn</span>
            <div style={{ fontWeight: 'bold' }}>{bigPayments} lần</div>
          </div>
        </div>

        {/* Tìm kiếm */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '12px', color: theme.subText }} size={18} />
          <input 
            placeholder="Tìm giao dịch, ngày tháng..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', 
              border: `1px solid ${theme.border}`, boxSizing: 'border-box',
              backgroundColor: theme.inputBg, color: theme.text
            }} 
          />
        </div>

        {/* Form thêm (Chỉ Admin) */}
        {role === 'admin' && (
          <div style={{ marginBottom: '20px' }}>
             <button onClick={handleDeleteAll} style={{ color: '#e74c3c', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '10px', float: 'right' }}>
               🗑️ Xóa sạch danh sách
             </button>
             <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', clear: 'both' }}>
                <select 
                  value={form.category} 
                  onChange={e => setForm({...form, category: e.target.value})}
                  style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }}
                >
                  <option value="Chung">Chung</option>
                  <option value="Ăn uống">Ăn uống</option>
                  <option value="Mua sắm">Mua sắm</option>
                  <option value="Lương">Lương</option>
                </select>
                <select 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})}
                  style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }}
                  >
                  <option value="EXPENSE">Chi phí (-)</option>
                  <option value="INCOME">Thu nhập (+)</option>
                </select>

                <input placeholder="Nội dung" value={form.paymentType} onChange={e => setForm({...form, paymentType: e.target.value})} 
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} />
                <input type="number" placeholder="Số tiền" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} 
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.text }} />
                <button type="submit" style={{ background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer' }}>
                  <PlusCircle size={22} />
                </button>
             </form>
          </div>
        )}

        {/* Danh sách giao dịch */}
        <div style={{ background: theme.card, borderRadius: '12px', boxShadow: darkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          {filteredPayments.length > 0 ? (
            filteredPayments.map((p, index) => (
              <div key={p.id} style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '18px', 
                borderBottom: index === filteredPayments.length - 1 ? 'none' : `1px solid ${theme.border}`,
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.paymentType}
                    <span style={{ 
                      fontSize: '0.65rem', 
                      backgroundColor: getCategoryColor(p.category).bg, 
                      color: getCategoryColor(p.category).text, 
                      padding: '2px 8px', borderRadius: '10px', fontWeight: '600'
                    }}>
                      {p.category || "Chung"}
                    </span>
                  </div>
                  <small style={{ color: theme.subText, fontSize: '0.75rem' }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : "Vừa xong"}
                  </small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ 
                      fontWeight: 'bold', 
                      color: p.type === 'INCOME' ? '#2ecc71' : '#e74c3c' // Xanh cho thu nhập, đỏ cho chi tiêu
                      }}>
                      {p.type === 'INCOME' ? '+' : '-'}{p.amount?.toLocaleString() || 0} ₫
                  </span>
                  {role === 'admin' && (
                    <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: theme.subText }}>
               🔍 Không tìm thấy kết quả nào...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;