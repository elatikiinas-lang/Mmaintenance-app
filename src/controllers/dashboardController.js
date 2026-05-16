const { fn, col, literal } = require("sequelize");
const Equipement = require("../models/Equipement");
const Intervention = require("../models/Intervention");
const Maintenance = require("../models/Maintenance");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEquipements = await Equipement.count();
    const equipementsEnPanne = await Equipement.count({
      where: { etat: "En panne" },
    });
    const equipementsEnMaintenance = await Equipement.count({
      where: { etat: "En maintenance" },
    });
    const interventionsOuvertes = await Intervention.count({
      where: { statut: "OUVERTE" },
    });
    const maintenancesProgrammees = await Maintenance.count({
      where: { statut: "PROGRAMMEE" },
    });
    const maintenancesEnRetard = await Maintenance.count({
      where: { statut: "EN_RETARD" },
    });
    const totalTechniciens = await User.count({ where: { role: "TECH" } });

    const pannesParStatut = await Intervention.findAll({
      attributes: ["statut", [fn("COUNT", col("id")), "total"]],
      group: ["statut"],
    });

    const equipementsPlusDefaillants = await Intervention.findAll({
      attributes: [
        "equipementId",
        [fn("COUNT", col("Intervention.id")), "totalPannes"],
      ],
      include: [
        {
          model: Equipement,
          attributes: ["id", "reference", "nom", "salle"],
        },
      ],
      group: [
        "equipementId",
        "Equipement.id",
        "Equipement.reference",
        "Equipement.nom",
        "Equipement.salle",
      ],
      order: [[literal("totalPannes"), "DESC"]],
      limit: 5,
    });

    const interventionsRecentes = await Intervention.findAll({
      include: [
        {
          model: Equipement,
          attributes: ["id", "reference", "nom"],
        },
        {
          model: User,
          as: "technicien",
          attributes: ["id", "nom", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    const tauxDisponibilite = totalEquipements
      ? Math.round(
          ((totalEquipements - equipementsEnPanne - equipementsEnMaintenance) /
            totalEquipements) *
            100
        )
      : 0;

    res.json({
      totalEquipements,
      equipementsEnPanne,
      equipementsEnMaintenance,
      interventionsOuvertes,
      maintenancesProgrammees,
      maintenancesEnRetard,
      totalTechniciens,
      tauxDisponibilite,
      pannesParStatut,
      equipementsPlusDefaillants,
      interventionsRecentes,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
