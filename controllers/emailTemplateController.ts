import EmailTemplate from "../models/EmailTemplate";

const createTemplate = async (req, res, next) => {
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
        next({
            status: 500,
            message: err.message,
        })
    }
}

const getTemplates = async (req, res, next) => {
    const query = req.user.role == "admin" ? {} : { createdBy: req.user.id }
    try {
        const templates = await EmailTemplate.find(query);
        res.status(200).json(templates);
    } catch (err) {
        next({
            status: 500,
            message: err.message,
        })
    }
}

const getTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }
        res.status(200).json(template);
    } catch (err) {
        next({
            status: 500,
            message: err.message,
        })
    }
}

const deleteTemplate = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const task = await EmailTemplate.findOneAndDelete({ _id: id, createdBy: req.user.id });
      if (!task) return res.status(404).json({ error: "Template not found" });
  
      res.status(200).json({ message: "Template deleted successfully" });
    } catch (err) {
        next({
            status: 500,
            message: err.message,
        })
    }
  };

export { createTemplate, getTemplates, getTemplate, deleteTemplate }