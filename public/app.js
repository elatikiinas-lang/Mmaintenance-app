const API_URL = "";

const state = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null"),
  section: "dashboard",
  equipements: [],
  users: [],
  interventions: [],
  maintenances: [],
};

const $ = (id) => document.getElementById(id);

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Erreur serveur");
  }

  return data;
};

const setMessage = (message, isError = true) => {
  $("appMessage").textContent = message || "";
  $("appMessage").style.color = isError ? "#b42318" : "#0f766e";
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("fr-FR");
};

const roleName = () => state.user?.role || "";

const canAdmin = () => roleName() === "ADMIN";

const canTech = () => roleName() === "TECH";

const showApp = () => {
  $("loginView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  $("userRole").textContent = `${state.user.nom} - ${state.user.role}`;
  document.querySelector('[data-section="dashboard"]').classList.toggle("hidden", roleName() === "USER");
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.classList.toggle("hidden", !canAdmin());
  });
  document.querySelectorAll(".admin-tech").forEach((el) => {
    el.classList.toggle("hidden", !(canAdmin() || canTech()));
  });
  switchSection(roleName() === "USER" ? "interventions" : "dashboard");
};

const showLogin = () => {
  $("loginView").classList.remove("hidden");
  $("appView").classList.add("hidden");
};

const switchSection = async (section) => {
  state.section = section;
  document.querySelectorAll(".page-section").forEach((el) => el.classList.add("hidden"));
  document.querySelectorAll(".nav-button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === section);
  });
  $(section).classList.remove("hidden");
  $("pageTitle").textContent = document.querySelector(`[data-section="${section}"]`)?.textContent || "Dashboard";
  setMessage("");
  await loadCurrentSection();
};

const loadCurrentSection = async () => {
  if (state.section === "dashboard") await loadDashboard();
  if (state.section === "equipements") await loadEquipements();
  if (state.section === "interventions") await loadInterventions();
  if (state.section === "maintenances") await loadMaintenances();
  if (state.section === "users") await loadUsers();
  if (state.section === "notifications") await loadNotifications();
};

const renderTable = (targetId, headers, rows) => {
  if (!rows.length) {
    $(targetId).innerHTML = "<div class='panel'>Aucune donnee.</div>";
    return;
  }

  $(targetId).innerHTML = `
    <table>
      <thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  `;
};

const loadDashboard = async () => {
  const stats = await request("/api/dashboard");

  $("dashboard").innerHTML = `
    <div class="stats-grid">
      <article class="stat-card"><span>Total equipements</span><strong>${stats.totalEquipements}</strong></article>
      <article class="stat-card"><span>En panne</span><strong>${stats.equipementsEnPanne}</strong></article>
      <article class="stat-card"><span>En maintenance</span><strong>${stats.equipementsEnMaintenance}</strong></article>
      <article class="stat-card"><span>Taux disponibilite</span><strong>${stats.tauxDisponibilite}%</strong></article>
      <article class="stat-card"><span>Interventions ouvertes</span><strong>${stats.interventionsOuvertes}</strong></article>
      <article class="stat-card"><span>Maintenances programmees</span><strong>${stats.maintenancesProgrammees}</strong></article>
      <article class="stat-card"><span>Maintenances en retard</span><strong>${stats.maintenancesEnRetard}</strong></article>
      <article class="stat-card"><span>Techniciens</span><strong>${stats.totalTechniciens}</strong></article>
    </div>
    <div class="panel">
      <h3>Interventions recentes</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Titre</th><th>Equipement</th><th>Technicien</th><th>Statut</th></tr></thead>
          <tbody>
            ${(stats.interventionsRecentes || [])
              .map(
                (item) => `
                  <tr>
                    <td>${item.titre}</td>
                    <td>${item.Equipement?.nom || "-"}</td>
                    <td>${item.technicien?.nom || "-"}</td>
                    <td><span class="badge">${item.statut}</span></td>
                  </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

const loadEquipements = async () => {
  state.equipements = await request("/api/equipements");
  fillEquipementOptions();

  const rows = state.equipements.map(
    (item) => `
      <tr>
        <td>${item.reference}</td>
        <td>${item.nom}</td>
        <td>${item.categorie || "-"}</td>
        <td>${item.salle || "-"}</td>
        <td><span class="badge ${item.etat === "En panne" ? "warning" : ""}">${item.etat}</span></td>
        <td>${item.statut || "-"}</td>
        <td class="row-actions">
          ${canAdmin() ? `<button onclick="editEquipement(${item.id})">Modifier</button><button class="danger-button" onclick="deleteEquipement(${item.id})">Supprimer</button>` : "-"}
        </td>
      </tr>`
  );

  renderTable("equipementsList", ["Reference", "Nom", "Categorie", "Salle", "Etat", "Statut", "Actions"], rows);
};

const fillEquipementOptions = () => {
  const options = state.equipements
    .map((item) => `<option value="${item.id}">${item.reference} - ${item.nom}</option>`)
    .join("");
  $("interventionEquipementId").innerHTML = options;
  $("maintenanceEquipementId").innerHTML = options;
};

const loadUsers = async () => {
  if (!canAdmin()) return;
  state.users = await request("/api/users");
  fillTechnicienOptions();

  const rows = state.users.map(
    (item) => `
      <tr>
        <td>${item.nom}</td>
        <td>${item.email}</td>
        <td><span class="badge">${item.role}</span></td>
        <td class="row-actions">
          <button onclick="editUser(${item.id})">Modifier</button>
          <button class="danger-button" onclick="deleteUser(${item.id})">Supprimer</button>
        </td>
      </tr>`
  );

  renderTable("usersList", ["Nom", "Email", "Role", "Actions"], rows);
};

const fillTechnicienOptions = () => {
  const techs = state.users.filter((item) => item.role === "TECH");
  const options = `<option value="">Technicien</option>${techs
    .map((item) => `<option value="${item.id}">${item.nom}</option>`)
    .join("")}`;
  $("interventionTechnicienId").innerHTML = options;
  $("maintenanceTechnicienId").innerHTML = options;
};

const loadInterventions = async () => {
  if (!state.equipements.length) await loadEquipements();
  if (canAdmin() && !state.users.length) await loadUsers();

  state.interventions = await request("/api/interventions");

  const rows = state.interventions.map(
    (item) => `
      <tr>
        <td>${item.titre}</td>
        <td>${item.Equipement?.nom || "-"}</td>
        <td>${item.technicien?.nom || "-"}</td>
        <td>${item.priorite}</td>
        <td><span class="badge">${item.statut}</span></td>
        <td>${formatDate(item.createdAt)}</td>
        <td class="row-actions">
          <button onclick="editIntervention(${item.id})">Modifier</button>
          <button class="danger-button" onclick="deleteIntervention(${item.id})">Supprimer</button>
        </td>
      </tr>`
  );

  renderTable("interventionsList", ["Titre", "Equipement", "Technicien", "Priorite", "Statut", "Date", "Actions"], rows);
};

const loadMaintenances = async () => {
  if (!state.equipements.length) await loadEquipements();
  if (canAdmin() && !state.users.length) await loadUsers();

  state.maintenances = await request("/api/maintenances");

  const rows = state.maintenances.map(
    (item) => `
      <tr>
        <td>${item.titre}</td>
        <td>${item.Equipement?.nom || "-"}</td>
        <td>${item.technicien?.nom || "-"}</td>
        <td>${item.type}</td>
        <td>${formatDate(item.datePrevue)}</td>
        <td><span class="badge ${item.statut === "EN_RETARD" ? "warning" : ""}">${item.statut}</span></td>
        <td class="row-actions">
          <button onclick="editMaintenance(${item.id})">Modifier</button>
          ${canAdmin() ? `<button class="danger-button" onclick="deleteMaintenance(${item.id})">Supprimer</button>` : ""}
        </td>
      </tr>`
  );

  renderTable("maintenancesList", ["Titre", "Equipement", "Technicien", "Type", "Date prevue", "Statut", "Actions"], rows);
};

const loadNotifications = async () => {
  const notifications = await request("/api/notifications");
  $("notificationsList").innerHTML = notifications.length
    ? notifications
        .map(
          (item) => `
            <article class="note-card">
              <p class="eyebrow">${item.type} - ${formatDate(item.createdAt)}</p>
              <h3>${item.titre}</h3>
              <p>${item.message}</p>
              <span class="badge">${item.lu ? "Lue" : "Non lue"}</span>
              <div class="row-actions">
                <button onclick="markNotificationRead(${item.id})">Marquer lue</button>
                <button class="danger-button" onclick="deleteNotification(${item.id})">Supprimer</button>
              </div>
            </article>`
        )
        .join("")
    : "<div class='panel'>Aucune notification.</div>";
};

const resetForm = (formId) => $(formId).reset();

window.editEquipement = (id) => {
  const item = state.equipements.find((entry) => entry.id === id);
  $("equipementId").value = item.id;
  $("equipementReference").value = item.reference;
  $("equipementNom").value = item.nom;
  $("equipementCategorie").value = item.categorie || "";
  $("equipementNumeroSerie").value = item.numeroSerie || "";
  $("equipementDateAchat").value = item.dateAchat ? item.dateAchat.slice(0, 10) : "";
  $("equipementEtat").value = item.etat;
  $("equipementSalle").value = item.salle || "";
  $("equipementStatut").value = item.statut || "Actif";
};

window.deleteEquipement = async (id) => {
  if (!confirm("Supprimer cet equipement ?")) return;
  await request(`/api/equipements/${id}`, { method: "DELETE" });
  await loadEquipements();
};

window.editUser = (id) => {
  const item = state.users.find((entry) => entry.id === id);
  $("userId").value = item.id;
  $("userNom").value = item.nom;
  $("userEmail").value = item.email;
  $("userPassword").value = "";
  $("userRoleInput").value = item.role;
};

window.deleteUser = async (id) => {
  if (!confirm("Supprimer cet utilisateur ?")) return;
  await request(`/api/users/${id}`, { method: "DELETE" });
  await loadUsers();
};

window.editIntervention = (id) => {
  const item = state.interventions.find((entry) => entry.id === id);
  $("interventionId").value = item.id;
  $("interventionTitre").value = item.titre;
  $("interventionType").value = item.type;
  $("interventionPriorite").value = item.priorite;
  $("interventionStatut").value = item.statut;
  $("interventionEquipementId").value = item.equipementId || "";
  $("interventionTechnicienId").value = item.technicienId || "";
  $("interventionDescription").value = item.description || "";
  $("interventionCommentaire").value = item.commentaire || "";
};

window.deleteIntervention = async (id) => {
  if (!confirm("Supprimer cette intervention ?")) return;
  await request(`/api/interventions/${id}`, { method: "DELETE" });
  await loadInterventions();
};

window.editMaintenance = (id) => {
  const item = state.maintenances.find((entry) => entry.id === id);
  $("maintenanceId").value = item.id;
  $("maintenanceTitre").value = item.titre;
  $("maintenanceType").value = item.type;
  $("maintenanceDatePrevue").value = item.datePrevue ? item.datePrevue.slice(0, 16) : "";
  $("maintenanceStatut").value = item.statut;
  $("maintenanceEquipementId").value = item.equipementId || "";
  $("maintenanceTechnicienId").value = item.technicienId || "";
  $("maintenanceDescription").value = item.description || "";
  $("maintenanceCommentaire").value = item.commentaire || "";
};

window.deleteMaintenance = async (id) => {
  if (!confirm("Supprimer cette maintenance ?")) return;
  await request(`/api/maintenances/${id}`, { method: "DELETE" });
  await loadMaintenances();
};

window.markNotificationRead = async (id) => {
  await request(`/api/notifications/${id}/read`, { method: "PUT" });
  await loadNotifications();
};

window.deleteNotification = async (id) => {
  await request(`/api/notifications/${id}`, { method: "DELETE" });
  await loadNotifications();
};

const bindEvents = () => {
  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    $("loginMessage").textContent = "";

    try {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: $("loginEmail").value,
          password: $("loginPassword").value,
        }),
      });

      state.token = data.token;
      state.user = data.user;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showApp();
    } catch (error) {
      $("loginMessage").textContent = error.message;
    }
  });

  $("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    state.token = null;
    state.user = null;
    showLogin();
  });

  $("refreshBtn").addEventListener("click", loadCurrentSection);

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => switchSection(button.dataset.section));
  });

  $("equipementForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("equipementId").value;
    const body = {
      reference: $("equipementReference").value,
      nom: $("equipementNom").value,
      categorie: $("equipementCategorie").value,
      numeroSerie: $("equipementNumeroSerie").value,
      dateAchat: $("equipementDateAchat").value || null,
      etat: $("equipementEtat").value,
      salle: $("equipementSalle").value,
      statut: $("equipementStatut").value,
    };
    await request(id ? `/api/equipements/${id}` : "/api/equipements", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    $("equipementId").value = "";
    resetForm("equipementForm");
    await loadEquipements();
  });

  $("userForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("userId").value;
    const body = {
      nom: $("userNom").value,
      email: $("userEmail").value,
      role: $("userRoleInput").value,
    };
    if ($("userPassword").value) body.password = $("userPassword").value;
    await request(id ? `/api/users/${id}` : "/api/users", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    $("userId").value = "";
    resetForm("userForm");
    await loadUsers();
  });

  $("interventionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("interventionId").value;
    const body = {
      titre: $("interventionTitre").value,
      type: $("interventionType").value,
      priorite: $("interventionPriorite").value,
      statut: $("interventionStatut").value,
      equipementId: $("interventionEquipementId").value,
      description: $("interventionDescription").value,
      commentaire: $("interventionCommentaire").value,
    };
    if (canAdmin()) {
      body.technicienId = $("interventionTechnicienId").value || null;
    }
    await request(id ? `/api/interventions/${id}` : "/api/interventions", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    $("interventionId").value = "";
    resetForm("interventionForm");
    await loadInterventions();
  });

  $("maintenanceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = $("maintenanceId").value;
    const body = {
      titre: $("maintenanceTitre").value,
      type: $("maintenanceType").value,
      datePrevue: $("maintenanceDatePrevue").value,
      statut: $("maintenanceStatut").value,
      equipementId: $("maintenanceEquipementId").value,
      description: $("maintenanceDescription").value,
      commentaire: $("maintenanceCommentaire").value,
    };
    if (canAdmin()) {
      body.technicienId = $("maintenanceTechnicienId").value || null;
    }
    await request(id ? `/api/maintenances/${id}` : "/api/maintenances", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body),
    });
    $("maintenanceId").value = "";
    resetForm("maintenanceForm");
    await loadMaintenances();
  });

  $("cancelEquipementEdit").addEventListener("click", () => {
    $("equipementId").value = "";
    resetForm("equipementForm");
  });
  $("cancelUserEdit").addEventListener("click", () => {
    $("userId").value = "";
    resetForm("userForm");
  });
  $("cancelInterventionEdit").addEventListener("click", () => {
    $("interventionId").value = "";
    resetForm("interventionForm");
  });
  $("cancelMaintenanceEdit").addEventListener("click", () => {
    $("maintenanceId").value = "";
    resetForm("maintenanceForm");
  });
};

const start = () => {
  bindEvents();
  if (state.token && state.user) {
    showApp();
  } else {
    showLogin();
  }
};

start();
