import express from "express";
import cors from "cors";
import { search } from "./api/spotify";
import supabase from "./db";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

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

app.get("/api/test-db", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: "Supabase client not initialized" });
    }
    const { data, error } = await supabase.from('song').select('*').limit(5);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("Test DB error:", err);
    res.status(500).json({ error: err?.message || "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});