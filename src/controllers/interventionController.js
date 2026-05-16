const Equipement = require("../models/Equipement");
const Intervention = require("../models/Intervention");
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
  {
    model: User,
    as: "demandeur",
    attributes: ["id", "nom", "email", "role"],
  },
];

const createNotification = async ({ userId, titre, message, type }) => {
  if (!userId) return;
  await Notification.create({ userId, titre, message, type });
};

exports.createIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.create({
      ...req.body,
      demandeurId: req.body.demandeurId || req.user.id,
    });

    if (req.body.equipementId) {
      await Equipement.update(
        { etat: "En panne" },
        { where: { id: req.body.equipementId } }
      );
    }

    if (req.body.technicienId) {
      await createNotification({
        userId: req.body.technicienId,
        titre: "Nouvelle panne",
        message: `Une intervention vous a ete affectee: ${intervention.titre}`,
        type: "PANNE",
      });
    }

    const interventionWithRelations = await Intervention.findByPk(intervention.id, {
      include: includeRelations,
    });

    res.status(201).json({
      message: "Intervention created",
      intervention: interventionWithRelations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllInterventions = async (req, res) => {
  try {
    const where = {};

    if (req.query.statut) {
      where.statut = req.query.statut;
    }

    if (req.query.equipementId) {
      where.equipementId = req.query.equipementId;
    }

    if (req.query.technicienId) {
      where.technicienId = req.query.technicienId;
    }

    if (req.user.role === "TECH") {
      where.technicienId = req.user.id;
    }

    if (req.user.role === "USER") {
      where.demandeurId = req.user.id;
    }

    const interventions = await Intervention.findAll({
      where,
      include: includeRelations,
      order: [["createdAt", "DESC"]],
    });

    res.json(interventions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInterventionById = async (req, res) => {
  try {
    const intervention = await Intervention.findByPk(req.params.id, {
      include: includeRelations,
    });

    if (!intervention) {
      return res.status(404).json({ message: "Intervention not found" });
    }

    if (req.user.role === "TECH" && intervention.technicienId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "USER" && intervention.demandeurId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(intervention);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findByPk(req.params.id);

    if (!intervention) {
      return res.status(404).json({ message: "Intervention not found" });
    }

    if (req.user.role === "TECH" && intervention.technicienId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (req.user.role === "USER" && intervention.demandeurId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await intervention.update(req.body);

    if (intervention.equipementId) {
      if (intervention.statut === "EN_COURS") {
        await Equipement.update(
          { etat: "En maintenance" },
          { where: { id: intervention.equipementId } }
        );
      }

      if (intervention.statut === "TERMINEE") {
        await Equipement.update(
          { etat: "Disponible" },
          { where: { id: intervention.equipementId } }
        );
      }
    }

    const interventionWithRelations = await Intervention.findByPk(intervention.id, {
      include: includeRelations,
    });

    res.json({
      message: "Intervention updated",
      intervention: interventionWithRelations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteIntervention = async (req, res) => {
  try {
    const intervention = await Intervention.findByPk(req.params.id);

    if (!intervention) {
      return res.status(404).json({ message: "Intervention not found" });
    }

    if (req.user.role !== "ADMIN" && intervention.demandeurId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await intervention.destroy();

    res.json({ message: "Intervention deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
