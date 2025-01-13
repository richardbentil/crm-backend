import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded)
    
    req.user = decoded

    next();
  } catch (err) {
    if(err.message === "jwt expired"){
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    res.status(500).json({ error: err.message });
  }
};

export default protect;
