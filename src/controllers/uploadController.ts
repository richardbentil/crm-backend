import cloudinary from "../config/cloudinary";
import Deal from "../models/Deal";
import { uploadToCloudinary } from "../utils/cloudinary";

// Function to delete a file from Cloudinary
const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

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
        uploadedAt: new Date(result.uploaded_at)
      };

      deal.attachments = deal.attachments || [];
      deal.attachments.push(attachment);

      await deal.save();

      res.status(200).json({ message: "File uploaded successfully", attachment });
    }

  
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getFiles = async (req, res) => {
  try {
    const { id } = req.params;

    const query: any = { createdBy: req.user.id, _id: id };

    const deals: any = await Deal.find(query).populate("attachments");
    res.status(200).json(deals.attachments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params; // Deal ID
    const { public_id } = req.body; // File public ID to delete from Cloudinary

    // Find the deal by ID
    const deal = await Deal.findOne({ _id: id, createdBy: req.user.id });
    if (!deal) return res.status(404).json({ error: "Deal not found" });

    // Ensure the file exists in the deal's attachments
    const attachmentIndex = deal.attachments.findIndex(
      (attachment) => attachment.public_id === public_id
    );
    if (attachmentIndex === -1) {
      return res.status(404).json({ error: "Attachment not found in this deal" });
    }

    // Delete the file from Cloudinary
    const cloudinaryResult = await deleteFromCloudinary(public_id);

    if (cloudinaryResult.result !== "ok") {
      return res.status(500).json({ error: "Failed to delete file on Cloudinary" });
    }

    // Remove the file from the deal's attachments array
    deal.attachments.splice(attachmentIndex, 1);
    
    await deal.save();

    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export { uploadFile, getFiles, deleteFile }