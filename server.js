let exp=require("express");
let mongoose=require("mongoose");
let server=exp();
let url='mongodb+srv://raghavdhiman2006:123@raghav.loyrcrt.mongodb.net/'
const {User,Property}=require("./schema.js");
let path = require("path");
server.use(exp.json());
server.use(exp.static(path.join(__dirname, 'public')));
mongoose.connect(url)
    .then(() => console.log(' MongoDB connected.'))
    .catch(err => console.error(' MongoDB connection error:', err));

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
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
server.get('/herbs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'herbs.html'));
});
server.get('/spices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'spices.html'));
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


server.listen(3039,()=>console.log("server listening on port 3000"));