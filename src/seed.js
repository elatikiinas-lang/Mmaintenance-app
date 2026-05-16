require("dotenv").config();

const bcrypt = require("bcrypt");
const sequelize = require("./config/db");
const User = require("./models/User");
const Equipement = require("./models/Equipement");
const Intervention = require("./models/Intervention");
const Maintenance = require("./models/Maintenance");
const Notification = require("./models/Notification");

async function createUser(data) {
  const [user] = await User.findOrCreate({
    where: { email: data.email },
    defaults: {
      nom: data.nom,
      password: await bcrypt.hash(data.password, 10),
      role: data.role,
    },
  });
  return user;
}

async function createEquipement(data) {
  const [equipement] = await Equipement.findOrCreate({
    where: { reference: data.reference },
    defaults: data,
  });
  return equipement;
}

async function seed() {
  try {
    await sequelize.sync({ alter: true });

    const admin = await createUser({
      nom: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    });

    const technicien = await createUser({
      nom: "Technicien",
      email: "technicien@example.com",
      password: "tech123",
      role: "TECH",
    });

    const demandeur = await createUser({
      nom: "Utilisateur",
      email: "user@example.com",
      password: "user123",
      role: "USER",
    });

    const equipement1 = await createEquipement({
      reference: "EQ-001",
      nom: "Imprimante Laser",
      categorie: "Impression",
      numeroSerie: "SN12345",
      dateAchat: new Date("2023-01-15"),
      etat: "Disponible",
      salle: "Bureau 12",
      statut: "Actif",
    });

    const equipement2 = await createEquipement({
      reference: "EQ-002",
      nom: "Ordinateur Portable",
      categorie: "Informatique",
      numeroSerie: "SN98765",
      dateAchat: new Date("2022-09-05"),
      etat: "En service",
      salle: "Salle 03",
      statut: "Actif",
    });

    await Intervention.findOrCreate({
      where: { titre: "Imprimante ne démarre pas" },
      defaults: {
        description: "L'imprimante affiche une erreur de pile papier alors qu'il n'y en a pas.",
        type: "PANNE",
        priorite: "HAUTE",
        statut: "OUVERTE",
        dateDebut: new Date(),
        commentaire: "Vérifier le capteur et le bac papier.",
        equipementId: equipement1.id,
        technicienId: technicien.id,
        demandeurId: demandeur.id,
      },
    });

    await Maintenance.findOrCreate({
      where: { titre: "Maintenance préventive ordinateur" },
      defaults: {
        description: "Nettoyage des ventilateurs et mise à jour du BIOS.",
        type: "PREVENTIVE",
        datePrevue: new Date(new Date().setDate(new Date().getDate() + 7)),
        statut: "PROGRAMMEE",
        commentaire: "Prévoir arrêt le weekend.",
        equipementId: equipement2.id,
        technicienId: technicien.id,
      },
    });

    await Notification.findOrCreate({
      where: { titre: "Nouvelle intervention créée" },
      defaults: {
        message: "Une intervention a été créée pour votre demande d'impression.",
        type: "PANNE",
        lu: false,
        userId: demandeur.id,
      },
    });

    console.log("Seed data inserted successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
