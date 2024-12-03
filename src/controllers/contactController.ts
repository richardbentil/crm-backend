import Contact from "../models/Contact";

const createContact = async (req, res) => {
  try {
    const { name, email, phone, company, notes } = req.body;
    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      notes,
      createdBy: req.user.id,
    });
    res.status(201).json({ message: "Contact created successfully", contact });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query: any = {
      createdBy: req.user.id,
    };

    if (search) query.name = search;
    if (search) query.company = { $regex: search, $options: "i" };

    const contacts = await Contact.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalContacts = await Contact.countDocuments({ createdBy: req.user.id });

    res.status(200).json({
      contacts,
      pagination: {
        totalContacts,
        currentPage: page,
        totalPages: Math.ceil(totalContacts / limit),
        pageSize: limit,
      },
    });
    
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updates,
      { new: true }
    );

    if (!contact) return res.status(404).json({ error: "Contact not found" });

    res.status(200).json({ message: "Contact updated successfully", contact });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findOneAndDelete({ _id: id, createdBy: req.user.id });
    if (!contact) return res.status(404).json({ error: "Contact not found" });

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { createContact, getContacts, updateContact, deleteContact };
