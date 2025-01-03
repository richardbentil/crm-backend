import EmailTemplate from "../models/EmailTemplate";

const createTemplate = async (req, res) => {
    try {
        const { name, subject, body } = req.body;

        const newTemplate = new EmailTemplate({
            name,
            subject,
            body,
            createdBy: req.user.id,
        });

        await newTemplate.save();
        res.status(201).json(newTemplate);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getTemplates = async (req, res) => {
    const query = req.user.role == "Admin" ? {} : { createdBy: req.user.id }
    try {
        const templates = await EmailTemplate.find(query);
        res.status(200).json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const getTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        res.status(200).json(template);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const deleteTemplate = async (req, res) => {
    try {
      const { id } = req.params;
  
      const task = await EmailTemplate.findOneAndDelete({ _id: id, createdBy: req.user.id });
      if (!task) return res.status(404).json({ error: "Template not found" });
  
      res.status(200).json({ message: "Template deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

export { createTemplate, getTemplates, getTemplate, deleteTemplate }