import Deal from "../models/Deal";
import Note from "../models/Note";
import Task from "../models/Task";
import Contact from "../models/Contact"
import ChatMessage from "../models/ChatMessage"

const createDeal = async (req, res, next) => {
  try {
    const {
      name,
      owner,
      value,
      stage,
      expectedCloseDate,
      description } = req.body;

    const deal = await Deal.create({
      name,
      value,
      stage,
      owner,
      expectedCloseDate,
      description,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Deal created successfully", deal });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
    })
  }
};

const getDeals = async (req, res, next) => {
  try {
    const { id } = req.params
    console.log(id)
    if (id !== undefined) {
      const deal = await Deal.findById(id, "name value stage owner createdAt description expectedCloseDate probability");
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }

      const notes = await Note.findOne({ dealId: id })
      const tasks = await Task.findOne({ dealId: id })
      const comments = await ChatMessage.findOne({ room: id })
      const owner = deal?.owner ? await Contact.findById(deal.owner, "name email phone") : null;
     
      return res.status(200).json({ 
        ...deal.toObject(),  // Convert to plain object if it's a mongoose document 
        owner, 
        notes: notes?.notes || [], 
        tasks: tasks?.tasks || [],
        comments: comments?.messages || [] 
      });
    }
    const { stage } = req.query;

    const query: any = req.user.role == "admin" ? {} : { createdBy: req.user.id };
    if (stage) query.stage = stage;

    const deals = await Deal.find(query).populate("owner", "name email");
    res.status(200).json(deals);
  } catch (err) {
    next({
      status: 500,
      message: err.message,
    })
  }
};

const updateDealStage = async (req, res, next) => {
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
    next({
      status: 500,
      message: err.message,
    })
  }
};


const deleteDeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findOneAndDelete({ _id: id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
    })
  }
};


const assignUser = async (req, res, next) => {
  try {
    const { userId, dealId } = req.body;

      await Deal.findOneAndUpdate(
        { _id: dealId },
        {
            assignee: userId
        }
      );
    
    res.status(200).json({ message: "Assigned user successfully" });
  } catch (err) {
    next({
      status: 500,
      message: err.message,
    })
  }
};

export { createDeal, getDeals, updateDealStage, deleteDeal, assignUser };
