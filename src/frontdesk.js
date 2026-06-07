const STORAGE_KEY = "kittiphat-frontdesk-payments-v1";
const PIN_KEY = "kittiphat-frontdesk-pin-v1";
const BACKUP_TIME_KEY = "kittiphat-frontdesk-backup-time-v1";
const BACKUP_ENABLED_KEY = "kittiphat-frontdesk-backup-enabled-v1";
const BACKUP_DONE_KEY = "kittiphat-frontdesk-backup-done-v1";

const state = {
  payments: loadPayments(),
  editingId: null,
  activeDate: today(),
  query: "",
  method: "all",
  autoBackupEnabled: localStorage.getItem(BACKUP_ENABLED_KEY) !== "false",
  autoBackupTime: localStorage.getItem(BACKUP_TIME_KEY) || "20:05",
};

const app = document.querySelector("#frontdesk-app");
let autoBackupTimer = null;

render();
setupAutoBackup();

function render() {
  app.innerHTML = hasPin() && !isUnlocked() ? lockTemplate() : appTemplate();
  bindEvents();
}

function appTemplate() {
  const dayRows = filteredPayments();
  const allForDay = state.payments.filter((item) => item.date === state.activeDate);
  const summary = summarize(allForDay);
  const monthSummary = summarize(
    state.payments.filter((item) => item.date.startsWith(state.activeDate.slice(0, 7)))
  );
  const editItem = state.payments.find((item) => item.id === state.editingId);

  return `
    <main class="app-shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Clinic front desk</p>
          <h1>ระบบรับเงินหน้าห้อง</h1>
          <p class="subhead">บันทึกรายการรับเงิน แยกเงินสด/เงินโอน และสรุปยอดรายวันสำหรับคลินิก</p>
        </div>
        <div class="top-actions">
          <button class="ghost-button" data-action="print">พิมพ์รายงาน</button>
          <button class="ghost-button" data-action="export-json">สำรองข้อมูล</button>
          <button class="danger-button" data-action="lock">ล็อกหน้าจอ</button>
        </div>
      </header>

      <section class="summary-grid" aria-label="สรุปยอด">
        ${summaryCard("เงินสดวันนี้", summary.cash, "cash")}
        ${summaryCard("เงินโอนวันนี้", summary.transfer, "transfer")}
        ${summaryCard("รวมวันนี้", summary.total, "total")}
        <article class="summary-card count">
          <span>จำนวนรายการวันนี้</span>
          <strong>${summary.count}</strong>
          <small>เดือนนี้ ${formatMoney(monthSummary.total)} จาก ${monthSummary.count} รายการ</small>
        </article>
      </section>

      <section class="workspace-grid">
        <form class="panel form-panel" id="payment-form">
          <div class="panel-heading">
            <div>
              <h2>${editItem ? "แก้ไขรายการ" : "เพิ่มรายการรับเงิน"}</h2>
              <p>ข้อมูลจะถูกเก็บใน browser เครื่องนี้ ควรสำรองข้อมูลเป็นประจำ</p>
            </div>
            ${editItem ? `<button type="button" class="ghost-button" data-action="cancel-edit">ยกเลิกแก้ไข</button>` : ""}
          </div>

          <div class="form-grid">
            <label>วันที่
              <input name="date" type="date" required value="${editItem?.date || state.activeDate}" />
            </label>
            <label>เวลา
              <input name="time" type="time" required value="${editItem?.time || nowTime()}" />
            </label>
            <label class="span-2">ชื่อผู้ป่วย/ลูกค้า
              <input name="name" required autocomplete="off" placeholder="เช่น คุณสมชาย" value="${escapeAttr(editItem?.name || "")}" />
            </label>
            <label>จำนวนเงิน
              <input name="amount" required type="number" min="0" step="1" inputmode="decimal" placeholder="0" value="${editItem?.amount || ""}" />
            </label>
            <label>ช่องทางชำระ
              <select name="method" required>
                <option value="cash" ${editItem?.method === "cash" ? "selected" : ""}>เงินสด</option>
                <option value="transfer" ${editItem?.method === "transfer" ? "selected" : ""}>เงินโอน</option>
              </select>
            </label>
            <label>รายการ
              <input name="service" autocomplete="off" placeholder="ค่าตรวจ / ค่ายา / X-ray" value="${escapeAttr(editItem?.service || "")}" />
            </label>
            <label>ผู้บันทึก
              <input name="staff" autocomplete="off" placeholder="ชื่อพนักงาน" value="${escapeAttr(editItem?.staff || "")}" />
            </label>
            <label class="span-2">หมายเหตุ
              <textarea name="note" placeholder="รายละเอียดเพิ่มเติม เช่น เลขสลิป หรือหมายเหตุอื่น">${escapeHtml(editItem?.note || "")}</textarea>
            </label>
          </div>

          <button class="primary-button" type="submit">${editItem ? "บันทึกการแก้ไข" : "บันทึกรายการ"}</button>
        </form>

        <aside class="panel tools-panel">
          <div class="panel-heading compact">
            <h2>ค้นหาและส่งออก</h2>
          </div>
          <label>เลือกวันที่สรุป
            <input id="active-date" type="date" value="${state.activeDate}" />
          </label>
          <label>ค้นหาชื่อ/รายการ/หมายเหตุ
            <input id="search-input" type="search" placeholder="พิมพ์เพื่อค้นหา" value="${escapeAttr(state.query)}" />
          </label>
          <label>ช่องทางชำระ
            <select id="method-filter">
              <option value="all" ${state.method === "all" ? "selected" : ""}>ทั้งหมด</option>
              <option value="cash" ${state.method === "cash" ? "selected" : ""}>เงินสด</option>
              <option value="transfer" ${state.method === "transfer" ? "selected" : ""}>เงินโอน</option>
            </select>
          </label>
          <div class="tool-buttons">
            <button class="ghost-button" data-action="export-csv">Export CSV วันนี้</button>
            <button class="ghost-button" data-action="export-csv-all">Export CSV ทั้งหมด</button>
            <button class="ghost-button" data-action="backup-today">สำรองวันนี้ทันที</button>
            <label class="file-button">นำเข้าไฟล์สำรอง
              <input id="import-json" type="file" accept="application/json" />
            </label>
          </div>
          <div class="auto-backup-card">
            <div>
              <strong>สำรองอัตโนมัติ</strong>
              <span>${backupStatusText()}</span>
            </div>
            <label class="switch-row">
              <input id="auto-backup-enabled" type="checkbox" ${state.autoBackupEnabled ? "checked" : ""} />
              <span>เปิดใช้งาน</span>
            </label>
            <label>เวลาปิดยอด
              <input id="auto-backup-time" type="time" value="${state.autoBackupTime}" />
            </label>
          </div>
          <div class="privacy-note">
            <strong>หมายเหตุความปลอดภัย</strong>
            <span>เมื่อถึงเวลาปิดยอด ระบบจะดาวน์โหลดไฟล์ backup ให้อัตโนมัติถ้าหน้านี้ยังเปิดอยู่ ตั้งค่า Chrome ให้บันทึกไฟล์ลง thumb drive ได้จาก Downloads settings</span>
          </div>
        </aside>
      </section>

      <section class="panel table-panel">
        <div class="panel-heading">
          <div>
            <h2>รายการประจำวันที่ ${formatThaiDate(state.activeDate)}</h2>
            <p>แสดง ${dayRows.length} รายการ จากทั้งหมด ${allForDay.length} รายการของวันนี้</p>
          </div>
          <button class="ghost-button" data-action="clear-filters">ล้างตัวกรอง</button>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>เวลา</th>
                <th>ชื่อ</th>
                <th>รายการ</th>
                <th>ชำระ</th>
                <th class="amount-cell">จำนวนเงิน</th>
                <th>ผู้บันทึก</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              ${dayRows.length ? dayRows.map(rowTemplate).join("") : emptyRow()}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `;
}

function lockTemplate() {
  return `
    <main class="lock-screen">
      <form class="lock-card" id="unlock-form">
        <p class="eyebrow">Clinic front desk</p>
        <h1>เข้าสู่ระบบรับเงิน</h1>
        <p>กรอก PIN เพื่อดูและบันทึกรายการรับเงินหน้าห้อง</p>
        <label>PIN
          <input name="pin" type="password" inputmode="numeric" autocomplete="current-password" required autofocus />
        </label>
        <button class="primary-button" type="submit">เข้าสู่ระบบ</button>
        <small id="lock-message"></small>
      </form>
    </main>
  `;
}

function bindEvents() {
  const form = document.querySelector("#payment-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      const payment = normalizePayment(data);
      if (!payment) return;

      if (state.editingId) {
        state.payments = state.payments.map((item) =>
          item.id === state.editingId ? { ...item, ...payment, id: item.id, createdAt: item.createdAt } : item
        );
        state.editingId = null;
      } else {
        state.payments.unshift({ ...payment, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      }
      state.activeDate = payment.date;
      persist();
      render();
    });
  }

  document.querySelector("#active-date")?.addEventListener("change", (event) => {
    state.activeDate = event.target.value || today();
    state.editingId = null;
    render();
  });

  document.querySelector("#search-input")?.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    render();
  });

  document.querySelector("#method-filter")?.addEventListener("change", (event) => {
    state.method = event.target.value;
    render();
  });

  document.querySelector("#import-json")?.addEventListener("change", importJson);

  document.querySelector("#auto-backup-enabled")?.addEventListener("change", (event) => {
    state.autoBackupEnabled = event.target.checked;
    localStorage.setItem(BACKUP_ENABLED_KEY, String(state.autoBackupEnabled));
    setupAutoBackup();
    render();
  });

  document.querySelector("#auto-backup-time")?.addEventListener("change", (event) => {
    state.autoBackupTime = event.target.value || "20:05";
    localStorage.setItem(BACKUP_TIME_KEY, state.autoBackupTime);
    setupAutoBackup();
    render();
  });

  document.querySelector("#unlock-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const pin = new FormData(event.currentTarget).get("pin");
    if (pin === localStorage.getItem(PIN_KEY)) {
      sessionStorage.setItem("frontdesk-unlocked", "true");
      render();
      return;
    }
    document.querySelector("#lock-message").textContent = "PIN ไม่ถูกต้อง";
  });

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleAction(button.dataset.action, button.dataset.id));
  });
}

function handleAction(action, id) {
  if (action === "edit") {
    state.editingId = id;
    render();
    document.querySelector("#payment-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (action === "delete") {
    const item = state.payments.find((payment) => payment.id === id);
    if (item && confirm(`ลบรายการของ ${item.name} จำนวน ${formatMoney(item.amount)} ใช่ไหม?`)) {
      state.payments = state.payments.filter((payment) => payment.id !== id);
      persist();
      render();
    }
  }
  if (action === "cancel-edit") {
    state.editingId = null;
    render();
  }
  if (action === "clear-filters") {
    state.query = "";
    state.method = "all";
    render();
  }
  if (action === "export-csv") exportCsv(filteredPayments(), `frontdesk-${state.activeDate}.csv`);
  if (action === "export-csv-all") exportCsv(state.payments, `frontdesk-all-${today()}.csv`);
  if (action === "export-json") exportJson();
  if (action === "backup-today") exportDailyBackup(state.activeDate, "manual");
  if (action === "print") window.print();
  if (action === "lock") {
    if (!hasPin()) {
      const pin = prompt("ตั้ง PIN สำหรับล็อกหน้าจอ เช่น 123456");
      if (!pin) return;
      localStorage.setItem(PIN_KEY, pin);
    }
    sessionStorage.removeItem("frontdesk-unlocked");
    render();
  }
}

function rowTemplate(item) {
  return `
    <tr>
      <td>${escapeHtml(item.time)}</td>
      <td><strong>${escapeHtml(item.name)}</strong>${item.note ? `<small>${escapeHtml(item.note)}</small>` : ""}</td>
      <td>${escapeHtml(item.service || "-")}</td>
      <td><span class="method-pill ${item.method}">${item.method === "cash" ? "เงินสด" : "เงินโอน"}</span></td>
      <td class="amount-cell">${formatMoney(item.amount)}</td>
      <td>${escapeHtml(item.staff || "-")}</td>
      <td class="row-actions">
        <button data-action="edit" data-id="${item.id}">แก้ไข</button>
        <button data-action="delete" data-id="${item.id}">ลบ</button>
      </td>
    </tr>
  `;
}

function emptyRow() {
  return `<tr><td colspan="7" class="empty-state">ยังไม่มีรายการตามเงื่อนไขนี้</td></tr>`;
}

function summaryCard(label, value, type) {
  return `
    <article class="summary-card ${type}">
      <span>${label}</span>
      <strong>${formatMoney(value)}</strong>
      <small>${type === "cash" ? "รับเป็นธนบัตร/เหรียญ" : type === "transfer" ? "โอนผ่านบัญชี/QR" : "ยอดรวมทุกช่องทาง"}</small>
    </article>
  `;
}

function filteredPayments() {
  const query = state.query.toLowerCase();
  return state.payments
    .filter((item) => item.date === state.activeDate)
    .filter((item) => (state.method === "all" ? true : item.method === state.method))
    .filter((item) => {
      if (!query) return true;
      return [item.name, item.service, item.staff, item.note].some((value) => String(value || "").toLowerCase().includes(query));
    })
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}

function summarize(rows) {
  return rows.reduce(
    (acc, item) => {
      const amount = Number(item.amount) || 0;
      acc.total += amount;
      acc.count += 1;
      if (item.method === "cash") acc.cash += amount;
      if (item.method === "transfer") acc.transfer += amount;
      return acc;
    },
    { cash: 0, transfer: 0, total: 0, count: 0 }
  );
}

function normalizePayment(data) {
  const amount = Number(data.amount);
  if (!data.name?.trim() || !data.date || !data.time || Number.isNaN(amount)) {
    alert("กรุณากรอกชื่อ วันที่ เวลา และจำนวนเงินให้ครบ");
    return null;
  }
  return {
    date: data.date,
    time: data.time,
    name: data.name.trim(),
    amount,
    method: data.method === "transfer" ? "transfer" : "cash",
    service: data.service?.trim() || "",
    staff: data.staff?.trim() || "",
    note: data.note?.trim() || "",
    updatedAt: new Date().toISOString(),
  };
}

function loadPayments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.payments));
}

function exportCsv(rows, filename) {
  const header = ["วันที่", "เวลา", "ชื่อ", "รายการ", "จำนวนเงิน", "ช่องทางชำระ", "ผู้บันทึก", "หมายเหตุ"];
  const body = rows.map((item) => [
    item.date,
    item.time,
    item.name,
    item.service,
    item.amount,
    item.method === "cash" ? "เงินสด" : "เงินโอน",
    item.staff,
    item.note,
  ]);
  const csv = [header, ...body].map((row) => row.map(csvCell).join(",")).join("\n");
  download(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }), filename);
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    payments: state.payments,
  };
  download(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `frontdesk-backup-${today()}.json`);
}

function exportDailyBackup(date, mode = "manual") {
  const rows = state.payments.filter((item) => item.date === date);
  if (!rows.length && mode === "manual") {
    alert("ยังไม่มีรายการของวันที่เลือกให้สำรอง");
    return;
  }
  if (!rows.length) return;

  const payload = {
    exportedAt: new Date().toISOString(),
    backupDate: date,
    summary: summarize(rows),
    payments: rows,
  };
  download(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    `frontdesk-daily-backup-${date}.json`
  );
  localStorage.setItem(BACKUP_DONE_KEY, date);
  if (mode === "manual") {
    alert(`สำรองข้อมูลวันที่ ${formatThaiDate(date)} แล้ว`);
  }
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const incoming = Array.isArray(data) ? data : data.payments;
      if (!Array.isArray(incoming)) throw new Error("invalid");
      if (confirm(`นำเข้าข้อมูล ${incoming.length} รายการ และแทนที่ข้อมูลเดิมในเครื่องนี้ใช่ไหม?`)) {
        state.payments = incoming;
        state.editingId = null;
        persist();
        render();
      }
    } catch {
      alert("ไฟล์สำรองไม่ถูกต้อง");
    }
  };
  reader.readAsText(file);
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function formatMoney(value) {
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(
    Number(value) || 0
  );
}

function formatThaiDate(date) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

function setupAutoBackup() {
  if (autoBackupTimer) window.clearInterval(autoBackupTimer);
  if (!state.autoBackupEnabled) return;
  checkAutoBackup();
  autoBackupTimer = window.setInterval(checkAutoBackup, 60 * 1000);
}

function checkAutoBackup() {
  if (!state.autoBackupEnabled) return;
  const date = today();
  const lastDone = localStorage.getItem(BACKUP_DONE_KEY);
  if (lastDone === date) return;
  if (nowTime() < state.autoBackupTime) return;

  const rows = state.payments.filter((item) => item.date === date);
  if (!rows.length) return;
  exportDailyBackup(date, "auto");
  render();
}

function backupStatusText() {
  if (!state.autoBackupEnabled) return "ปิดอยู่";
  const lastDone = localStorage.getItem(BACKUP_DONE_KEY);
  if (lastDone === today()) return `วันนี้สำรองแล้ว เวลา ${state.autoBackupTime}`;
  return `จะดาวน์โหลด backup ทุกวันเวลา ${state.autoBackupTime} ถ้าเปิดหน้านี้ไว้`;
}

function hasPin() {
  return Boolean(localStorage.getItem(PIN_KEY));
}

function isUnlocked() {
  return sessionStorage.getItem("frontdesk-unlocked") === "true";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}
