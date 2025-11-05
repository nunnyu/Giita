import express from "express";
import cors from "cors";
import { search } from "./spotify";

const app = express();
const port = 5000;

app.use(cors());
app.get("/api/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  try {
    const results = await search(query);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
