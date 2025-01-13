import EmailTemplate from "../models/EmailTemplate";
import Lead from "../models/Lead";
import * as cheerio from "cheerio";
// Backend: leadsController.js
import axios from "axios";

// Backend API: server.js
const sendEmailToLeads =  async (req, res) => {
    const { leadIds, templateId } = req.body;
  
    try {
      const leads = await Lead.find({ _id: { $in: leadIds } });
      const template = await EmailTemplate.findById(templateId);
  
      // Mock email sending logic
      leads.forEach((lead) => {
        console.log(`Sending email to ${lead.email} with subject: ${template.subject}`);
        // Add actual email sending logic here (e.g., SendGrid, Nodemailer, etc.)
      });
  
      res.status(200).json({ message: "Emails sent successfully." });
    } catch (error) {
      console.error("Error sending emails:", error);
      res.status(500).json({ message: "Failed to send emails." });
    }
  };
  
  const searchInternetLeads = async (req, res) => {
    try {
      const { platform, industry, keywords, location, page = 1, limit = 10 } = req.query;
  
      let apiUrl = "";
      let headers = {};
  
      // Define the number of items to skip based on page and limit
      const offset = (page - 1) * limit;
  
      // Platform-specific API URLs and headers
      switch (platform) {
        case "LinkedIn":
          apiUrl = `https://api.linkedin.com/v2/leads?keywords=${keywords}&industry=${industry}&location=${location}&start=${offset}&count=${limit}`;
          headers = {
            Authorization: `Bearer YOUR_LINKEDIN_API_TOKEN`,
          };
          break;
  
        case "Twitter":
          apiUrl = `https://api.twitter.com/2/tweets/search/recent?query=${keywords}&max_results=${limit}`;
          headers = {
            Authorization: `Bearer YOUR_TWITTER_API_TOKEN`,
          };
          break;
  
        case "Instagram":
          apiUrl = `https://graph.instagram.com/leads?query=${keywords}&limit=${limit}&offset=${offset}`;
          headers = {
            Authorization: `Bearer YOUR_INSTAGRAM_API_TOKEN`,
          };
          break;
  
        case "Facebook":
          apiUrl = `https://graph.facebook.com/v15.0/leads?query=${keywords}&limit=${limit}&offset=${offset}`;
          headers = {
            Authorization: `Bearer YOUR_FACEBOOK_API_TOKEN`,
          };
          break;
  
        case "Google":
          apiUrl = `https://api.google.com/leads/search?query=${keywords}&limit=${limit}&offset=${offset}`;
          headers = {
            Authorization: `Bearer YOUR_GOOGLE_API_TOKEN`,
          };
          break;
  
        case "CustomPlatform":
          apiUrl = `https://api.customplatform.com/leads?keywords=${keywords}&industry=${industry}&location=${location}&limit=${limit}&offset=${offset}`;
          headers = {
            Authorization: `Bearer YOUR_CUSTOM_API_TOKEN`,
          };
          break;
  
        default:
          return res.status(400).json({ message: "Invalid platform specified" });
      }
  
      const response = await axios.get(apiUrl, { headers });
      const leads = response.data;
  
      // For scraping platforms that lack APIs
      if (platform === "ScrapePlatform") {
        const htmlResponse = await axios.get(apiUrl); // Example scraping API
        const $ = cheerio.load(htmlResponse.data);
  
        // Extract leads from the HTML
        const scrapedLeads = [];
        $(".lead-item").each((index, element) => {
          scrapedLeads.push({
            name: $(element).find(".lead-name").text() || "Unknown",
            email: $(element).find(".lead-email").text() || "N/A",
            industry: $(element).find(".lead-industry").text() || industry,
            location: $(element).find(".lead-location").text() || location,
          });
        });
  
        return res.status(200).json({
          data: scrapedLeads.slice(offset, offset + limit),
          currentPage: page,
          totalLeads: scrapedLeads.length,
        });
      }
  
      // Transform leads to a unified format
      const transformedLeads = leads.map((lead) => ({
        name: lead.name || lead.title || "Unknown",
        email: lead.email || "N/A",
        industry: lead.industry || industry,
        location: lead.location || location,
        platform,
      }));
  
      res.status(200).json({
        data: transformedLeads,
        currentPage: page,
        totalLeads: leads.length, // Assuming the response includes total lead count
      });
    } catch (error) {
      console.error("Error fetching internet leads:", error);
      res.status(500).json({ message: "Error fetching internet leads", error });
    }
  };
  

const saveLeads = async(req, res) => {
    const { leads } = req.body;
  
    // Save leads to your database
    await Lead.insertMany(leads)
    res.status(200).json({ message: "Leads saved successfully!" });
  };
  

module.exports = { searchInternetLeads, sendEmailToLeads, saveLeads };
