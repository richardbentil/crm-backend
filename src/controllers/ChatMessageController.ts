import ChatMessage from "../models/ChatMessage";

export const saveMessage = async (req, res) => {
    try {
      const { room, message } = req.body;
  
      const chatMessage = await ChatMessage.findOneAndUpdate(
        { room },
        {
          $push: {
            messages: {
              sender: req.user.id,
              text: message,
            },
          },
        },
        { new: true, upsert: true } // Create the document if it doesn't exist
      );
  
      res.status(201).json(chatMessage);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

  export const getMessages = async (req, res) => {
    try {
      const { room } = req.params;
  
      const chatMessages = await ChatMessage.findOne({ room }).populate("messages.sender", "name email");
  
      if (!chatMessages) {
        return res.status(404).json({ error: "No messages found for this room" });
      }
  
      res.status(200).json(chatMessages.messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
