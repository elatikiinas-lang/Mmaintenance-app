const { Op } = require("sequelize");
const Equipement = require("../models/Equipement");
const Maintenance = require("../models/Maintenance");
const Notification = require("../models/Notification");
const User = require("../models/User");

const includeRelations = [
  {
    model: Equipement,
    attributes: ["id", "reference", "nom", "categorie", "salle", "etat"],
  },
  {
    model: User,
    as: "technicien",
    attributes: ["id", "nom", "email", "role"],
  },
];

const createNotification = async ({ userId, titre, message, type }) => {
  if (!userId) return;
  await Notification.create({ userId, titre, message, type });
};

const updateLateMaintenances = async () => {
  const lateMaintenances = await Maintenance.findAll({
    where: {
      statut: "PROGRAMMEE",
      datePrevue: { [Op.lt]: new Date() },
    },
  });

  await Promise.all(
    lateMaintenances.map(async (maintenance) => {
      await maintenance.update({ statut: "EN_RETARD" });
      await createNotification({
        userId: maintenance.technicienId,
        titre: "Maintenance en retard",
        message: `La maintenance est en retard: ${maintenance.titre}`,
        type: "RETARD",
      });
    })
  );
};

exports.createMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.create(req.body);

    if (req.body.technicienId) {
      await createNotification({
        userId: req.body.technicienId,
        titre: "Maintenance programmee",
        message: `Une maintenance est programmee: ${maintenance.titre}`,
        type: "MAINTENANCE",
      });
    }

    const maintenanceWithRelations = await Maintenance.findByPk(maintenance.id, {
      include: includeRelations,
    });

    res.status(201).json({
      message: "Maintenance created",
      maintenance: maintenanceWithRelations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllMaintenances = async (req, res) => {
  try {
    await updateLateMaintenances();

    const where = {};

    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.type) where.type = req.query.type;
    if (req.query.equipementId) where.equipementId = req.query.equipementId;
    if (req.query.technicienId) where.technicienId = req.query.technicienId;

    if (req.user.role === "TECH") {
      where.technicienId = req.user.id;
    }

    const maintenances = await Maintenance.findAll({
      where,
      include: includeRelations,
      order: [["datePrevue", "ASC"]],
    });

    res.json(maintenances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id, {
      include: includeRelations,
    });

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    if (req.user.role === "TECH" && maintenance.technicienId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    if (req.user.role === "TECH" && maintenance.technicienId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await maintenance.update(req.body);

    if (maintenance.equipementId) {
      if (maintenance.statut === "EN_COURS") {
        await Equipement.update(
          { etat: "En maintenance" },
          { where: { id: maintenance.equipementId } }
        );
      }

      if (maintenance.statut === "TERMINEE") {
        await Equipement.update(
          { etat: "Disponible" },
          { where: { id: maintenance.equipementId } }
        );
      }
    }

    const maintenanceWithRelations = await Maintenance.findByPk(maintenance.id, {
      include: includeRelations,
    });

    res.json({
      message: "Maintenance updated",
      maintenance: maintenanceWithRelations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByPk(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ message: "Maintenance not found" });
    }

    await maintenance.destroy();

    res.json({ message: "Maintenance deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
