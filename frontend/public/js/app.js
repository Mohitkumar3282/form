document.addEventListener('DOMContentLoaded', () => {
  // Dynamic API Base URL (auto-detects local dev vs production deployment)
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE_URL = isLocal && window.location.port === '3000' 
    ? 'http://localhost:5000' 
    : window.location.origin;

  // DOM Element Selectors
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  const customerForm = document.getElementById('customerForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const successBanner = document.getElementById('successBanner');
  const resetFormBtn = document.getElementById('resetFormBtn');
  
  // Inputs & Counters
  const nameInput = document.getElementById('name');
  const mobileInput = document.getElementById('mobile');
  const vehicleInput = document.getElementById('vehicleNumber');
  const addressInput = document.getElementById('address');
  const addressCharCount = document.getElementById('addressCharCount');
  
  // Admin Auth Elements
  const adminAuthCard = document.getElementById('adminAuthCard');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const adminPasswordInput = document.getElementById('adminPasswordInput');
  const adminLoginErr = document.getElementById('adminLoginErr');
  const recordsDashboardContent = document.getElementById('recordsDashboardContent');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  // Records Tab Elements
  const recordsTableBody = document.getElementById('recordsTableBody');
  const searchInput = document.getElementById('searchInput');
  const totalCountEl = document.getElementById('totalCount');
  const todayCountEl = document.getElementById('todayCount');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const refreshRecordsBtn = document.getElementById('refreshRecordsBtn');
  
  // QR Tab Elements
  const qrImage = document.getElementById('qrImage');
  const targetUrlInput = document.getElementById('targetUrlInput');
  const copyLinkBtn = document.getElementById('copyLinkBtn');
  const downloadQrBtn = document.getElementById('downloadQrBtn');
  const generateQrBtn = document.getElementById('generateQrBtn');
  
  // Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');

  // State Variables
  let storedRecords = [];

  // --- 1. TAB NAVIGATION ---
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      
      if (targetTab === 'recordsTab') {
        checkAdminSession();
      } else if (targetTab === 'qrTab') {
        loadQrCode();
      }
    });
  });

  // --- 2. ADMIN AUTHENTICATION MANAGEMENT ---
  function checkAdminSession() {
    const adminKey = sessionStorage.getItem('adminKey');
    if (adminKey) {
      adminAuthCard.style.display = 'none';
      recordsDashboardContent.style.display = 'block';
      fetchRecords();
    } else {
      adminAuthCard.style.display = 'block';
      recordsDashboardContent.style.display = 'none';
    }
  }

  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    adminLoginErr.classList.remove('show');
    
    const password = adminPasswordInput.value.trim();
    if (!password) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/verify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        sessionStorage.setItem('adminKey', result.adminKey);
        adminPasswordInput.value = '';
        showToast('Admin authorized successfully!', 'success');
        checkAdminSession();
      } else {
        adminLoginErr.classList.add('show');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      showToast('Connection error to backend server.', 'error');
    }
  });

  adminLogoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminKey');
    showToast('Admin logged out.', 'success');
    checkAdminSession();
  });

  // --- 3. INPUT FORMATTING & LIVE VALIDATION ---
  vehicleInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
    validateField(vehicleInput, /^[A-Z0-9\-\s]{4,15}$/, 'vehicleErr');
  });

  mobileInput.addEventListener('input', () => {
    validateField(mobileInput, /^\+?[0-9\s\-]{10,15}$/, 'mobileErr');
  });

  nameInput.addEventListener('input', () => {
    validateField(nameInput, /^.{2,100}$/, 'nameErr');
  });

  addressInput.addEventListener('input', (e) => {
    const len = e.target.value.length;
    addressCharCount.textContent = `${len} / 300`;
    if (len >= 5 && len <= 300) {
      clearFieldError(addressInput, 'addressErr');
    }
  });

  function validateField(inputEl, regex, errorId) {
    const val = inputEl.value.trim();
    if (!val || !regex.test(val)) {
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
      document.getElementById(errorId).classList.add('show');
      return false;
    } else {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      document.getElementById(errorId).classList.remove('show');
      return true;
    }
  }

  function clearFieldError(inputEl, errorId) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.classList.remove('show');
  }

  // --- 4. FORM SUBMISSION (PUBLIC FORM) ---
  customerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const isNameValid = validateField(nameInput, /^.{2,100}$/, 'nameErr');
    const isMobileValid = validateField(mobileInput, /^\+?[0-9\s\-]{10,15}$/, 'mobileErr');
    const isVehicleValid = validateField(vehicleInput, /^[A-Z0-9\-\s]{4,15}$/, 'vehicleErr');
    const isAddressValid = addressInput.value.trim().length >= 5 && addressInput.value.trim().length <= 300;

    if (!isAddressValid) {
      addressInput.classList.add('is-invalid');
      document.getElementById('addressErr').classList.add('show');
    }

    if (!isNameValid || !isMobileValid || !isVehicleValid || !isAddressValid) {
      showToast('Please fix the validation errors in the form.', 'error');
      return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'block';

    const payload = {
      name: nameInput.value.trim(),
      mobile: mobileInput.value.trim(),
      vehicleNumber: vehicleInput.value.trim().toUpperCase(),
      address: addressInput.value.trim()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        customerForm.style.display = 'none';
        successBanner.style.display = 'block';
        showToast('Vehicle details registered successfully!', 'success');
      } else {
        const errMsg = result.errors ? result.errors.join(' | ') : result.message;
        showToast(errMsg || 'Failed to submit form.', 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Network error: Unable to reach backend API at port 5000.', 'error');
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'block';
      btnSpinner.style.display = 'none';
    }
  });

  resetFormBtn.addEventListener('click', () => {
    customerForm.reset();
    [nameInput, mobileInput, vehicleInput, addressInput].forEach(el => {
      el.classList.remove('is-valid', 'is-invalid');
    });
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
    addressCharCount.textContent = '0 / 300';
    successBanner.style.display = 'none';
    customerForm.style.display = 'block';
  });

  // --- 5. FETCH STORED RECORDS (PROTECTED ADMIN API CALL) ---
  async function fetchRecords() {
    const adminKey = sessionStorage.getItem('adminKey');
    if (!adminKey) {
      checkAdminSession();
      return;
    }

    try {
      recordsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="spinner" style="margin: 0 auto 1rem;"></div>
            Loading stored records from backend...
          </td>
        </tr>
      `;

      const searchVal = searchInput.value.trim();
      const url = searchVal 
        ? `${API_BASE_URL}/api/customers?search=${encodeURIComponent(searchVal)}` 
        : `${API_BASE_URL}/api/customers`;
      
      const response = await fetch(url, {
        headers: {
          'x-admin-key': adminKey
        }
      });

      if (response.status === 401) {
        sessionStorage.removeItem('adminKey');
        showToast('Session expired or unauthorized. Please re-enter passcode.', 'error');
        checkAdminSession();
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        storedRecords = result.data || [];
        renderTable(storedRecords);
        updateStats(storedRecords);
      } else {
        recordsTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="empty-state">
              <div class="empty-icon">⚠️</div>
              Unable to load records: ${result.message || 'Server error'}
            </td>
          </tr>
        `;
      }
    } catch (err) {
      console.error('Fetch records error:', err);
      recordsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-icon">🔌</div>
            Connection error: Make sure backend API server is running on port 5000.
          </td>
        </tr>
      `;
    }
  }

  function renderTable(records) {
    if (!records || records.length === 0) {
      recordsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-icon">📂</div>
            No customer records found. Submit a form to add entries!
          </td>
        </tr>
      `;
      return;
    }

    recordsTableBody.innerHTML = records.map(rec => {
      const dateFormatted = new Date(rec.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <tr>
          <td>
            <strong style="color: var(--text-primary); font-weight: 700;">${escapeHtml(rec.name)}</strong>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 0.85rem;">${escapeHtml(rec.mobile)}</span>
          </td>
          <td>
            <span class="vehicle-badge">${escapeHtml(rec.vehicleNumber)}</span>
          </td>
          <td>
            <span style="color: var(--text-secondary); font-size: 0.85rem;">${escapeHtml(rec.address)}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">${dateFormatted}</span>
              <button class="action-btn" title="Delete Record" onclick="deleteCustomerRecord('${rec._id}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateStats(records) {
    totalCountEl.textContent = records.length;
    
    const today = new Date().toDateString();
    const todayCount = records.filter(r => new Date(r.createdAt).toDateString() === today).length;
    todayCountEl.textContent = todayCount;
  }

  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchRecords, 300);
  });

  refreshRecordsBtn.addEventListener('click', fetchRecords);

  window.deleteCustomerRecord = async function(id) {
    const adminKey = sessionStorage.getItem('adminKey');
    if (!adminKey) {
      showToast('Admin key missing', 'error');
      return;
    }

    if (!confirm('Are you sure you want to delete this customer record?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': adminKey
        }
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast('Record deleted successfully', 'success');
        fetchRecords();
      } else {
        showToast(result.message || 'Could not delete record.', 'error');
      }
    } catch (err) {
      showToast('Error deleting record.', 'error');
    }
  };

  exportCsvBtn.addEventListener('click', () => {
    if (!storedRecords || storedRecords.length === 0) {
      showToast('No records available to export.', 'error');
      return;
    }

    const headers = ['Customer Name', 'Mobile Number', 'Vehicle Number', 'Address', 'Date Registered'];
    const rows = storedRecords.map(r => [
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.mobile.replace(/"/g, '""')}"`,
      `"${r.vehicleNumber.replace(/"/g, '""')}"`,
      `"${r.address.replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_vehicle_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV export downloaded!', 'success');
  });

  // --- 6. QR CODE GENERATOR API CALL ---
  async function loadQrCode() {
    try {
      const currentHost = window.location.origin;
      const targetUrl = targetUrlInput.value.trim() || currentHost;
      
      if (!targetUrlInput.value) {
        targetUrlInput.value = currentHost;
      }

      const response = await fetch(`${API_BASE_URL}/api/qr?url=${encodeURIComponent(targetUrl)}`);
      const result = await response.json();

      if (response.ok && result.success) {
        qrImage.src = result.qrCodeUrl;
      } else {
        showToast('Failed to generate QR Code.', 'error');
      }
    } catch (err) {
      console.error('QR Load error:', err);
    }
  }

  generateQrBtn.addEventListener('click', loadQrCode);

  copyLinkBtn.addEventListener('click', () => {
    const url = targetUrlInput.value.trim() || window.location.origin;
    navigator.clipboard.writeText(url).then(() => {
      showToast('Form URL copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link.', 'error');
    });
  });

  downloadQrBtn.addEventListener('click', () => {
    if (!qrImage.src) return;
    const a = document.createElement('a');
    a.href = qrImage.src;
    a.download = `customer_form_qr_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('QR Code image downloaded!', 'success');
  });

  // --- 7. TOAST SYSTEM ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '⚠️';
    
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- 8. THEME TOGGLE ---
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
});
