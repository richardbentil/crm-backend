import fs from "fs";
import csvParser from "csv-parser";
import Contact from "../models/Contact";
import fastCsv from "fast-csv";

const importContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const results: any[] = [];
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data: any) => results.push(data))
      .on("end", async () => {
        // Map results to contact fields
        const contacts = results.map((item: any) => ({
          name: item.name,
          email: item.email,
          phone: item.phone,
          company: item.company,
          createdBy: req.user.id,
        }));

        // Bulk insert contacts
        await Contact.insertMany(contacts);

        res.status(200).json({ message: "Contacts imported successfully", contacts });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const exportContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ createdBy: req.user.id }).select(
      "name email phone company"
    );

    const csvStream = fastCsv.format({ headers: true });
    res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
    res.setHeader("Content-Type", "text/csv");

    csvStream.pipe(res);
    contacts.forEach((contact) => csvStream.write(contact.toObject()));
    csvStream.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export { importContacts, exportContacts };
