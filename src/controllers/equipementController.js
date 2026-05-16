const Equipement = require("../models/Equipement");

exports.createEquipement = async (req, res) => {
  try {
    const equipement = await Equipement.create(req.body);

    res.status(201).json({
      message: "Equipement created",
      equipement,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEquipements = async (req, res) => {
  try {
    const equipements = await Equipement.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json(equipements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEquipementById = async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);

    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }

    res.json(equipement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEquipement = async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);

    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }

    await equipement.update(req.body);

    res.json({
      message: "Equipement updated",
      equipement,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEquipement = async (req, res) => {
  try {
    const equipement = await Equipement.findByPk(req.params.id);

    if (!equipement) {
      return res.status(404).json({ message: "Equipement not found" });
    }

    await equipement.destroy();

    res.json({ message: "Equipement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
