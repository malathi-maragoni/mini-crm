// 🌙 Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// 🔐 Protect page
if (!localStorage.getItem("loggedIn")) {
  window.location.href = "login.html";
}

const API = "http://localhost:5000";

// ➕ Add Lead
async function addLead() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  if (!name || !email) {
    alert("Please enter name and email");
    return;
  }

  try {
    await fetch(API + "/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email })
    });

    // clear inputs
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";

    loadLeads();

  } catch (err) {
    console.error(err);
    alert("Error adding lead");
  }
}

// 📄 Load Leads
async function loadLeads() {
  try {
    const res = await fetch(API + "/leads");
    let data = await res.json();

    const search = document.getElementById("search").value.toLowerCase();
    const filter = document.getElementById("filter").value;

    // 📊 Stats
    document.getElementById("total").innerText = data.length;

    const converted = data.filter(l => l.status === "converted").length;
    document.getElementById("converted").innerText = converted;

    // 📊 Chart Data
    const newCount = data.filter(l => l.status === "new").length;
    const contacted = data.filter(l => l.status === "contacted").length;
    const convertedCount = data.filter(l => l.status === "converted").length;

    // 🎯 Filter
    if (filter) {
      data = data.filter(l => l.status === filter);
    }

    // 🔍 Search
    if (search) {
      data = data.filter(l =>
        l.name.toLowerCase().includes(search)
      );
    }

    const container = document.getElementById("leads");
    container.innerHTML = "";

    // 🧾 Render Leads
    data.forEach(lead => {
      container.innerHTML += `
        <div class="card">
          <h3>${lead.name}</h3>
          <p>${lead.email}</p>

          <p><b>Status:</b> ${lead.status}</p>

          <p><b>Created:</b> ${
            lead.createdAt && !isNaN(new Date(lead.createdAt))
              ? new Date(lead.createdAt).toLocaleString()
              : "Not available"
          }</p>

          <div style="margin-top:10px;">
            <button onclick="updateStatus('${lead._id}','contacted')">Contacted</button>
            <button onclick="updateStatus('${lead._id}','converted')">Converted</button>
            <button onclick="deleteLead('${lead._id}')" style="background:red;">Delete</button>
          </div>

          <div style="margin-top:10px;">
            <input id="note-${lead._id}" placeholder="Add note">
            <button onclick="addNote('${lead._id}')">Add Note</button>
          </div>

          <p style="margin-top:10px;">
            <b>Notes:</b> ${
              lead.notes && lead.notes.length
                ? lead.notes.join(", ")
                : "No notes yet"
            }
          </p>
        </div>
      `;
    });

    // 📊 Render Chart
    renderChart(newCount, contacted, convertedCount);

  } catch (err) {
    console.error(err);
    alert("Error loading leads");
  }
}

// 🔄 Update Status
async function updateStatus(id, status) {
  try {
    await fetch(API + "/status/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    loadLeads();

  } catch (err) {
    console.error(err);
    alert("Error updating status");
  }
}

// 📝 Add Note
async function addNote(id) {
  const noteInput = document.getElementById("note-" + id);
  const note = noteInput.value;

  if (!note) {
    alert("Enter a note");
    return;
  }

  try {
    await fetch(API + "/note/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ note })
    });

    noteInput.value = "";
    loadLeads();

  } catch (err) {
    console.error(err);
    alert("Error adding note");
  }
}

// ❌ Delete Lead
async function deleteLead(id) {
  if (!confirm("Are you sure you want to delete this lead?")) return;

  try {
    const res = await fetch(API + "/delete/" + id, {
      method: "DELETE"
    });

    const data = await res.json();

    if (res.ok) {
      loadLeads();
    } else {
      alert(data.message || "Delete failed");
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

// 🔓 Logout
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

// 🌙 Toggle Dark Mode
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}

// 📊 Chart
let chart;

function renderChart(newCount, contacted, convertedCount) {
  const ctx = document.getElementById("myChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["New", "Contacted", "Converted"],
      datasets: [{
        label: "Leads",
        data: [newCount, contacted, convertedCount],
        backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"],
        borderRadius: 6
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

// 🚀 Load on start
loadLeads();