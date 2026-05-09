const postDatabase = [
    { id: 1, type: "Pothole", city: "Bengaluru", upvotes: 542, user: "TechieOnScooty", time: "2h ago", imageUrl: "javascript/images/bad_road.png", text: "Silk Board is not a road, it's a test of patience and suspension. My spine is screaming! 😭 Is there a subscription to fix this or what? #SiliconValleyProblems", feeling: "Frustrated 😡" },
    { id: 2, type: "Garbage", city: "Hyderabad", upvotes: 188, user: "BiryaniLover44", time: "5h ago", imageUrl: "javascript/images/garbage.png", text: "The dump near Charminar is growing faster than my career. The smell is literally heartbreaking. 🤢 Can we get some 'Swachh' in this 'Bharat' please?", feeling: "Heartbroken 💔" },
    { id: 3, type: "Street Light", city: "Pune", upvotes: 210, user: "PuneKaka", time: "1d ago", imageUrl: "javascript/images/lights.png", text: "Darkness in Kothrud lanes. Walking here at night is like playing a horror game. 🔦 Digital India needs lights on the street first, sirs!", feeling: "Worried 😟" },
    { id: 4, type: "Waterlog", city: "Mumbai", upvotes: 850, user: "SpiritOfMumbai", time: "1h ago", imageUrl: "javascript/images/water.png", text: "Andheri Subway is now Andheri Swimming Pool. 🏊‍♂️ Expecting the local train to be replaced by a submarine soon. BMC zindabad! 😂", feeling: "Sarcastic 😏" },
    { id: 5, type: "Air Quality", city: "Delhi", upvotes: 720, user: "ChaiAndCiggy", time: "3h ago", text: "AQI is so high I can see the air I'm breathing. Free cigarettes for everyone in Delhi! 😷 My lungs have left the group chat.", feeling: "Suffocating 😵" },
    { id: 6, type: "Traffic", city: "Bengaluru", upvotes: 310, user: "PeakBengaluru", time: "6h ago", text: "Saw a guy complete an entire movie on Netflix while waiting at the Sarjapur signal. 🎬 Efficient use of time or government failure? You decide.", feeling: "Sarcastic 😏" },
    { id: 7, type: "Open Manhole", city: "Chennai", upvotes: 420, user: "SafetyFirstAnna", time: "4h ago", imageUrl: "javascript/images/pothole1.png", text: "Open pothole in T.Nagar. It's a death trap! 🛑 Authorities are waiting for an accident to happen before they wake up. Sharam karo!", feeling: "Angry 🌋" },
    { id: 8, type: "Power Cut", city: "Lucknow", upvotes: 95, user: "MuskuraiyeAapLucknow Mein", time: "8h ago", text: "3 hours of power cut in this heat. My inverter is also giving up on life. 🥵 Where are the 'Smart City' vibes now?", feeling: "Exhausted 😩" },
    { id: 9, type: "Road Quality", city: "Nagpur", upvotes: 55, user: "OrangeCityRider", time: "12h ago", imageUrl: "javascript/images/damaged_road.png", text: "The new highway is already broken. It's like they used Fevistick instead of cement. 🤡 Our tax money at work, folks!", feeling: "Disappointed 😞" },
    { id: 10, type: "Water Supply", city: "Ahmedabad", upvotes: 130, user: "GujjuBhai", time: "7h ago", text: "Yellow water coming from the taps today. Is this Dhokla flavored water or just dirt? 🤢 Sort it out, AMC!", feeling: "Disgusted 🤮" },
    { id: 11, type: "Encroachment", city: "Kolkata", upvotes: 112, user: "PhuchkaLover", time: "2d ago", text: "Footpaths are for walking, not for parking 10 bikes and a stall. 🚶‍♂️ Have to walk on the main road and risk my life. Classic.", feeling: "Annoyed 😑" },
    { id: 12, type: "Stray Dogs", city: "Gurugram", upvotes: 89, user: "CyberHubHabibi", time: "10h ago", text: "Pack of 10 dogs chasing delivery guys in Sector 45. 🐕 Someone is going to get seriously hurt. Can someone please take action?", feeling: "Worried 😟" },
    { id: 13, type: "Noise", city: "Jaipur", upvotes: 77, user: "PinkCitySilence", time: "5h ago", text: "Loudspeakers at 2 AM on a Tuesday? My sleep has been officially murdered. 😴 Why are laws only for common people?", feeling: "Sleepy & Mad 😴💢" },
    { id: 14, type: "Parks", city: "Patna", upvotes: 40, user: "BihariSwag", time: "1d ago", text: "The local park is now a grazing ground for cows. 🐄 Guess the kids have to play football with the bulls now. Humara Bihar!", feeling: "Amused 😂" },
    { id: 15, type: "Internet", city: "Indore", upvotes: 150, user: "IndoriPoha", time: "9h ago", text: "Fiber cut again because they are digging the road for the 10th time this month. 🚜 Coordination level = Zero. 🤡", feeling: "Frustrated 😡" }
];
function savePostToDB(text, city, feeling, imageUrl = null) {
    const newEntry = {
        id: postDatabase.length + 1,
        type: "Community Rant",
        city: city,
        upvotes: 1,
        user: "Citizen_" + Math.floor(Math.random() * 1000),
        time: "Just now",
        text: text,
        feeling: feeling,
        imageUrl: imageUrl
    };

    postDatabase.unshift(newEntry);
    return true;
}

function updateVotes(id, amount) {
    const post = postDatabase.find(p => p.id === id);
    if (post) {
        post.upvotes += amount;
    }
}