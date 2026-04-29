import exp from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { User, Property } from "./schema.js";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});



const server = exp();
const url = "mongodb+srv://raghavdhiman2006:123@raghav.loyrcrt.mongodb.net/";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
server.use(exp.json());
server.use(exp.static(path.join(__dirname, 'public')));
mongoose.connect(url)
    .then(() => console.log(' MongoDB connected.'))
    .catch(err => console.error(' MongoDB connection error:', err));


async function extractKeywords(prompt) {
  const response = await client.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free", // valid free model on OpenRouter, // ✅ correct
    messages: [
      {
        role: "system",
        content: "Extract real estate keywords like school, hospital, luxury, peaceful, metro, mall. Return ONLY JSON array.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  let text = response.choices[0].message.content.trim();

  try {
    const match = text.match(/\[.*\]/);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return [];
  }
}
const synonymMap = {
  hospitals: "hospital",
  schools: "school",
  clinic: "hospital",
  "near hospital": "hospital",
  "near school": "school",
};
function normalize(word) {
  word = word.toLowerCase();
  return synonymMap[word] || word;
}

function cleanAmenity(a) {
  return a.toLowerCase().replace("near ", "").trim();
}

function scoreProperty(property, keywords) {
  let score = 0;

  const title = (property.Name || "").toLowerCase();
  const description = (property.description || "").toLowerCase();
  const amenities = (property.amenities || []).map(a => cleanAmenity(a));

  keywords.forEach((k) => {
    const keyword = normalize(k);

    if (amenities.includes(keyword)) score += 5;
    if (title.includes(keyword)) score += 3;
    if (description.includes(keyword)) score += 2;
  });

  return score;
}

function fallbackKeywords(prompt) {
  const text = prompt.toLowerCase();

  const mapping = {
    school: ["school"],
    hospital: ["hospital"],
    peaceful: ["peaceful","peace"],
    luxury: ["luxury"],
    metro: ["metro"],
    mall: ["mall"],
    
  };

  const result = [];

  for (let key in mapping) {
    if (mapping[key].some(word => text.includes(word))) {
      result.push(key);
    }
  }

  return result;
}

server.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});
server.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

server.get('/registrations', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'regis.html'));
});
server.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
server.get('/listing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'listing.html'));
});
server.get('/information', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'herbs.html'));
});
server.get('/maps', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'spices.html'));
});
server.get('/buy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'buy.html'));
});
server.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});
server.post('/signup', async (req, res) => {
  try {
    const user = req.body;
    console.log("Received user:", user);

    // Check if user with same email already exists
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      return res.status(400).send({ message: "Email already registered" });
    }

    // Create new user if not existing
    const newUser = await User.create(user);
    console.log("User created:", newUser);

    res.status(201).send({ message: "Signup successful", user: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send({ message: "Signup failed", error: err.message });
  }
});

server.post('/verify', async (req, res) => {       
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).send({ message: "Login successful", user });
        } else {
            res.status(401).send({ message: "Invalid email or password" });
        }

    }
    catch(err){

    }

 })


server.post('/list', async (req, res) => {       
  try {
    const property = req.body;   // extract data from request body

    // Validate required fields
   

    // Create and save a new document in MongoDB
     const newUser = await Property.create(property);
        console.log("Property created:", newUser);

    res.status(201).send({ message: "Listing saved successfully", data: newUser });
  } catch (err) {
    console.error("Error saving listing:", err);
    res.status(500).send({ message: "Failed to save listing", error: err.message });
  }
});


server.get('/listfetch', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const listings = await Property.find({ email: email });
    res.status(200).send({ message: "Listings fetched successfully", listings });
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).send({ message: "Failed to fetch listings", error: err.message });
  }
});



server.get("/listed", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email ) {
      return res.status(400).json({
        message: "Missing user identifier (email or wallet)",
      });
    }

   const filter = {
      isSold: false,
      $nor: [
        
        { email: email }
      ]
    };

    const properties = await Property.find(filter).sort({ listedAt: -1 });

    res.json({ success: true, listings: properties });
  } catch (err) {
    console.error("Error fetching listed properties:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


server.post("/buy/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { buyerWallet, buyerEmail, blockchainTx } = req.body;

    if (!buyerWallet || !buyerEmail || !blockchainTx) {
      return res.status(400).json({ message: "Missing buyer details" });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    

    if ( property.email === buyerEmail) {
      return res.status(400).json({ message: "You already own this property" });
    }

    // ✅ Update ownership
    property.previousOwner = property.owner;
    property.owner = buyerWallet;
    property.email = buyerEmail;
    property.blockchainTx = blockchainTx;
    property.isSold = true;
    property.soldAt = new Date();

    await property.save();

    res.json({
      success: true,
      message: "✅ Property purchased successfully!",
      property
    });
  } catch (err) {
    console.error("Error buying property:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
server.post("/ai-search", async (req, res) => {
  try {
    const { prompt } = req.body;

    let keywords = [];
    try {
      keywords = await extractKeywords(prompt);
      console.log("🔑 AI Keywords:", keywords);
    } catch (aiErr) {
      console.warn("AI failed:", aiErr.message);
    }

    if (!keywords || keywords.length === 0) {
      keywords = fallbackKeywords(prompt);
      console.log("🔑 Fallback Keywords:", keywords);
    }

    const properties = await Property.find({ isSold: false }).limit(100);
    console.log("🏠 Properties found in DB:", properties.length);

    if (properties.length > 0) {
      console.log("📦 Sample property:", JSON.stringify(properties[0], null, 2));
    }

    const scored = properties.map((prop) => ({
      ...prop.toObject(),
      score: scoreProperty(prop, keywords),
    }));

    console.log("📊 Scores:", scored.map(p => ({ name: p.Name, score: p.score, amenities: p.amenities })));

    const results = scored
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log("✅ Final results count:", results.length);

    res.json({ extracted_keywords: keywords, results });

  } catch (err) {
    console.error("AI search error:", err);
    res.status(500).json({ error: "AI search failed" });
  }
});


server.listen(3032,()=>console.log("server listening on port 3000"));
