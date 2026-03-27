/**
 * ============================================================
 *  FastQueue — React Frontend
 * ============================================================
 *
 * STRUKTUR KOMPONEN:
 *   <App>
 *   ├── <ToastContainer>   — notifikasi pop-up
 *   ├── <Header>           — logo + status server
 *   ├── <StatsRow>         — 3 kartu statistik
 *   └── <MainGrid>
 *       ├── <OrderForm>    — form tambah pesanan + tombol proses
 *       └── <OrderTabs>    — tab antrean & riwayat
 *
 * STATE MANAGEMENT:
 *   Semua state disimpan di komponen <App> (lifted state),
 *   lalu diteruskan ke child via props. Ini pola standar React
 *   untuk aplikasi skala kecil-menengah.
 *
 * DATA FLOW:
 *   App → fetch API Crow → setState → re-render komponen
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import './App.css'

const API = ''

// ============================================================
// HOOK: useToast
// Custom hook untuk mengelola notifikasi toast
// Memisahkan logika toast dari komponen utama agar lebih bersih
// ============================================================
function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, msg) => {
    // Setiap toast punya ID unik berdasarkan timestamp
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, msg }])

    // Otomatis hapus setelah 3.5 detik
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return { toasts, addToast }
}

// ============================================================
// KOMPONEN: ToastContainer
// Menampilkan semua notifikasi toast di pojok kanan atas
// ============================================================
function ToastContainer({ toasts }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.msg}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// KOMPONEN: StatCard
// Satu kartu statistik dengan animasi bump saat nilai berubah
// ============================================================
function StatCard({ label, value, bump }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${bump ? 'bump' : ''}`}>{value}</div>
    </div>
  )
}

// ============================================================
// KOMPONEN: OrderCard (Queue)
// Satu baris pesanan dalam antrean
// ============================================================
function QueueCard({ order }) {
  return (
    <div className="order-card">
      <div className="order-position">{order.position}</div>
      <div className="order-info">
        <div className="order-customer">{order.customer}</div>
        <div className="order-menu">{order.menu}</div>
      </div>
      <div className="order-meta">
        <div className="order-id">#{String(order.order_id).padStart(4, '0')}</div>
        <div className="order-qty">×{order.quantity}</div>
      </div>
    </div>
  )
}

// ============================================================
// KOMPONEN: HistoryCard
// Satu baris pesanan dalam riwayat
// ============================================================
function HistoryCard({ order }) {
  return (
    <div className="order-card">
      <div className="order-history-icon">✓</div>
      <div className="order-info">
        <div className="order-customer">{order.customer}</div>
        <div className="order-menu">{order.menu}</div>
      </div>
      <div className="order-meta">
        <div className="order-id">#{String(order.order_id).padStart(4, '0')}</div>
        <div className="order-qty">×{order.quantity}</div>
      </div>
    </div>
  )
}

// ============================================================
// KOMPONEN: EmptyState
// Ditampilkan ketika list kosong
// ============================================================
function EmptyState({ icon, text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p>{text}</p>
    </div>
  )
}

// ============================================================
// KOMPONEN: OrderForm
// Form untuk menambah pesanan + tombol proses
//
// Props:
//   onAdd     → callback saat form disubmit
//   onProcess → callback saat tombol proses diklik
//   isProcessing → boolean, true saat sedang memproses
// ============================================================
function OrderForm({ onAdd, onProcess, isProcessing }) {
  // State lokal untuk input form — hanya relevan di komponen ini
  const [customer, setCustomer] = useState('')
  const [menu, setMenu] = useState('')
  const [qty, setQty] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = async () => {
    if (!customer.trim() || !menu.trim() || !qty || parseInt(qty) < 1) return

    setIsAdding(true)
    // Kirim data ke parent (App), tunggu selesai
    await onAdd({ customer: customer.trim(), menu: menu.trim(), quantity: parseInt(qty) })
    // Reset form setelah berhasil
    setCustomer('')
    setMenu('')
    setQty('')
    setIsAdding(false)
  }

  // Tekan Enter = submit form
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>📝</span> Tambah Pesanan
        </div>
      </div>
      <div className="panel-body">
        <div className="form-group">
          <label className="form-label">Nama Pelanggan</label>
          <input
            className="form-input"
            type="text"
            placeholder="cth. Budi Santoso"
            value={customer}
            onChange={e => setCustomer(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Menu Pesanan</label>
          <input
            className="form-input"
            type="text"
            placeholder="cth. Burger Spesial"
            value={menu}
            onChange={e => setMenu(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Jumlah</label>
          <input
            className="form-input"
            type="number"
            placeholder="1"
            min="1"
            value={qty}
            onChange={e => setQty(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isAdding}
        >
          {isAdding ? 'Menambahkan...' : '+ Tambahkan ke Antrean'}
        </button>

        <div className="divider" />

        <button
          className={`btn btn-process ${isProcessing ? 'processing' : ''}`}
          onClick={onProcess}
          disabled={isProcessing}
        >
          {isProcessing ? '⚡ Memproses...' : '⚡ Proses Pesanan Berikutnya'}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// KOMPONEN: OrderTabs
// Tab untuk menampilkan antrean dan riwayat
// ============================================================
function OrderTabs({ queue, history }) {
  // State lokal: tab mana yang aktif
  const [activeTab, setActiveTab] = useState('queue')

  return (
    <div className="panel">
      {/* Tab Headers */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <span>🕐 Antrean</span>
          <span className="tab-count">{queue.length}</span>
        </div>
        <div
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>📋 Riwayat</span>
          <span className="tab-count">{history.length}</span>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'queue' && (
        <div className="tab-panel">
          {queue.length === 0
            ? <EmptyState icon="🕐" text={'Belum ada pesanan\ndalam antrean'} />
            : queue.map(o => <QueueCard key={o.order_id} order={o} />)
          }
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-panel">
          {history.length === 0
            ? <EmptyState icon="📋" text={'Belum ada riwayat\npesanan diproses'} />
            : history.map(o => <HistoryCard key={o.order_id} order={o} />)
          }
        </div>
      )}
    </div>
  )
}

// ============================================================
// KOMPONEN UTAMA: App
//
// Ini "otak" aplikasi — menyimpan semua data dan
// mendistribusikannya ke komponen-komponen di bawahnya.
// ============================================================
function App() {
  // ── STATE ──────────────────────────────────────────────
  const [queue, setQueue]           = useState([])    // Data antrean dari API
  const [history, setHistory]       = useState([])    // Data riwayat dari API
  const [isProcessing, setIsProcessing] = useState(false)
  const [bumpQueue, setBumpQueue]   = useState(false) // Trigger animasi stat
  const [bumpProcessed, setBumpProcessed] = useState(false)

  const { toasts, addToast } = useToast()

  // ── FETCH DATA ─────────────────────────────────────────
  // useCallback agar fungsi tidak dibuat ulang setiap render
  const fetchAll = useCallback(async () => {
    try {
      // Fetch queue dan history secara paralel — lebih efisien
      const [qRes, hRes] = await Promise.all([
        axios.get(`${API}/queue`),
        axios.get(`${API}/history`)
      ])
      setQueue(qRes.data.queue || [])
      setHistory(hRes.data.history || [])
    } catch {
      // Diam saja jika server belum siap — tidak perlu spam error
    }
  }, [])

  // ── EFFECT: Fetch saat pertama kali load + auto-refresh ─
  useEffect(() => {
    fetchAll() // Fetch langsung saat komponen pertama kali mount

    // Auto-refresh setiap 5 detik
    const interval = setInterval(fetchAll, 5000)

    // Cleanup: hentikan interval saat komponen di-unmount
    // Ini penting untuk mencegah memory leak
    return () => clearInterval(interval)
  }, [fetchAll])

  // ── HANDLER: Tambah Pesanan ────────────────────────────
  const handleAdd = async ({ customer, menu, quantity }) => {
    try {
      const res = await axios.post(`${API}/order`, { customer, menu, quantity })
      if (res.data.status === 'success') {
        addToast('success', 'Pesanan Ditambahkan!', `${customer} — ${menu} ×${quantity}`)
        // Animasi bump stat
        setBumpQueue(true)
        setTimeout(() => setBumpQueue(false), 400)
        await fetchAll()
      }
    } catch {
      addToast('error', 'Koneksi Gagal', 'Pastikan server Crow berjalan di port 8080')
    }
  }

  // ── HANDLER: Proses Pesanan ────────────────────────────
  const handleProcess = async () => {
    setIsProcessing(true)
    try {
      const res = await axios.post(`${API}/process`)
      if (res.data.status === 'success') {
        const o = res.data.data
        addToast('success', 'Pesanan Diproses!', `${o.customer} — ${o.menu} ×${o.quantity}`)
        setBumpProcessed(true)
        setTimeout(() => setBumpProcessed(false), 400)
        await fetchAll()
      } else {
        addToast('info', 'Antrean Kosong', 'Tidak ada pesanan yang perlu diproses')
      }
    } catch {
      addToast('error', 'Koneksi Gagal', 'Pastikan server Crow berjalan di port 8080')
    }
    setIsProcessing(false)
  }

  // ── RENDER ─────────────────────────────────────────────
  return (
    <>
      <ToastContainer toasts={toasts} />

      <div className="container">
        {/* Header */}
        <header>
          <div className="logo">
            <div className="logo-icon">🍔</div>
            <div className="logo-text">
              <h1>FastQueue</h1>
              <span>Order Management System</span>
            </div>
          </div>
          <div className="status-badge">
            <div className="status-dot" />
            Server Online — localhost:8080
          </div>
        </header>

        {/* Stats */}
        <div className="stats-row">
          <StatCard label="Dalam Antrean"  value={queue.length}   bump={bumpQueue} />
          <StatCard label="Total Diproses" value={history.length} bump={bumpProcessed} />
          <StatCard label="Total Order"    value={queue.length + history.length} />
        </div>

        {/* Main */}
        <div className="main-grid">
          <OrderForm
            onAdd={handleAdd}
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
          <OrderTabs queue={queue} history={history} />
        </div>
      </div>
    </>
  )
}

export default App