import Deal from "../models/Deal";
import { uploadToCloudinary } from "../utils/cloudinary";

const uploadFile = async (req, res) => {
  try {

    //upload to cloudinary
    const result: any = await uploadToCloudinary(req.file);
    if (!result.url) return res.status(400).json({ error: "Failed to upload file" });

    if (req.body.collection == "deal") {
      const deal: any = await Deal.findById(req.params.id);

      if (!deal) return res.status(404).json({ error: "Deal not found" });

      const attachment = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      deal.attachments = deal.attachments || [];
      deal.attachments.push(attachment);

      await deal.save();
    }


    res.status(200).json({ message: "File uploaded successfully", file: req.file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getFiles = async (req, res) => {
  try {
    const { stage } = req.query;

    const query: any = { createdBy: req.user.id };
    if (stage) query.stage = stage;

    const deals = await Deal.find(query).populate("owner", "name email");
    res.status(200).json(deals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findOneAndDelete({ _id: id, createdBy: req.user.id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    res.status(200).json({ message: "Deal deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { uploadFile, getFiles, deleteFile }