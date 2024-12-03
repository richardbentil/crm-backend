const Deal = require("../models/Deal");

const createDeal = async (req, res) => {
  try {
    const { name, value, stage, owner } = req.body;

    const deal = await Deal.create({
      name,
      value,
      stage,
      owner,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Deal created successfully", deal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getDeals = async (req, res) => {
  try {
    const { stage } = req.query;

    const query: any = req.user.role == "Admin" ? {} : { createdBy: req.user.id };
    if (stage) query.stage = stage;

    const deals = await Deal.find(query).populate("owner", "name email");
    res.status(200).json(deals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateDealStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!["Lead", "Opportunity", "Won", "Lost"].includes(stage)) {
      return res.status(400).json({ error: "Invalid stage" });
    }

    const deal = await Deal.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      { stage },
      { new: true }
    );

    if (!deal) return res.status(404).json({ error: "Deal not found" });

    res.status(200).json({ message: "Deal stage updated successfully", deal });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findOneAndDelete({ _id: id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { createDeal, getDeals, updateDealStage, deleteDeal };
