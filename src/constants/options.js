export const LOCATIONS = [
  'Pune',
  'Nashik',
  'Nagpur',
  'Hyderabad',
  'Warangal',
  'Vijayawada',
  'Bengaluru',
  'Mysuru',
  'Chennai',
  'Coimbatore',
  'Indore',
  'Bhopal',
  'Jaipur',
  'Lucknow',
  'Patna',
  'Kolkata',
]

export const STATES = [
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Maharashtra',
  'Karnataka',
  'Rajasthan',
  'Gujarat',
  'Punjab',
  'Haryana',
  'Bihar',
  'Telangana',
  'Andhra Pradesh'
]

export const DISTRICTS_BY_STATE = {
  'Uttar Pradesh': [
    'Etah', 'Agra', 'Aligarh', 'Bulandshahar', 'Sitapur', 'Lucknow', 'Kanpur', 'Varanasi', 'Bareilly', 
    'Meerut', 'Mathura', 'Ghaziabad', 'Prayagraj', 'Jhansi', 'Gorakhpur', 'Azamgarh', 'Basti', 'Gonda', 
    'Mirzapur', 'Hardoi', 'Unnao', 'Ayodhya', 'Mainpuri', 'Firozabad', 'Hathras', 'Sahranpur'
  ],
  'Madhya Pradesh': [
    'Badwani', 'Bhopal', 'Indore', 'Gwalior', 'Ujjain', 'Dewas', 'Jabalpur', 'Khandwa', 'Ratlam', 
    'Mandsaur', 'Neemuch', 'Vidisha', 'Sagar', 'Khargone', 'Hoshangabad', 'Sehore'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule',
    'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur', 'Nanded',
    'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli',
    'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  'Rajasthan': [
    'Jaipur', 'Alwar', 'Bikaner', 'Kota', 'Jodhpur', 'Udaipur', 'Barmer', 'Sikar', 'Bharatpur', 
    'Ganganagar', 'Hanumangarh', 'Tonk', 'Ajmer'
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Belgaum', 'Hubli', 'Gulbarga', 'Shimoga', 'Hassan', 'Tumakuru', 
    'Davangere', 'Bagalkot', 'Raichur'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Junagadh', 'Mehsana', 'Amreli', 'Bhavnagar', 
    'Anand', 'Banaskantha', 'Patan'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Mahabubnagar'
  ],
  'Andhra Pradesh': [
    'Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore', 'Kurnool', 'Kakinada'
  ],
}

export const MARKETS_BY_DISTRICT = {
  'Etah': ['Awagarh APMC', 'Aliganj APMC', 'Kasganj APMC', 'Ganjdundwara APMC'],
  'Agra': ['Achnera APMC', 'Agra APMC', 'Fatehabad APMC', 'Jagnair APMC', 'Samsabad APMC'],
  'Ahmednagar': ['Ahmednagar APMC', 'Rahuri APMC', 'Sangamner APMC', 'Kopargaon APMC', 'Shrirampur APMC'],
  'Solapur': ['Solapur APMC', 'Pandharpur APMC', 'Barshi APMC', 'Akluj APMC'],
  'Jalgaon': ['Jalgaon APMC', 'Chopda APMC', 'Raver APMC', 'Amalner APMC'],
  'Kolhapur': ['Kolhapur APMC', 'Jaysingpur APMC', 'Vadgaon APMC'],
  'Pune': ['Pune APMC', 'Manchar APMC', 'Junner APMC', 'Shirur APMC', 'Khed APMC', 'Daund APMC'],
  'Nashik': ['Nashik APMC', 'Lasalgaon APMC', 'Pimpalgaon APMC', 'Yeola APMC', 'Sinnar APMC', 'Manmad APMC', 'Niphad APMC', 'Satana APMC', 'Malegaon APMC'],
  'Indore': ['Indore APMC', 'Mhow APMC', 'Sanwer APMC', 'Depalpur APMC'],
  'Nagpur': ['Nagpur APMC', 'Kalmeshwar APMC', 'Saoner APMC', 'Katol APMC'],
  'Jaipur': ['Jaipur APMC', 'Chomu APMC', 'Shahpura APMC', 'Lalsot APMC'],
  'Ahmedabad': ['Ahmedabad APMC', 'Sanand APMC', 'Bavla APMC', 'Dholka APMC'],
  'Lucknow': ['Lucknow APMC', 'Malihabad APMC', 'Nigram APMC'],
  'Kanpur': ['Kanpur APMC', 'Choubepur APMC', 'Rura APMC'],
  'Sangli': ['Sangli APMC', 'Tasgaon APMC', 'Vita APMC', 'Islampur APMC'],
  'Satara': ['Satara APMC', 'Karad APMC', 'Phaltan APMC', 'Wai APMC'],
}

export const SOIL_TYPES = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Loamy', 'Clay', 'Sandy', 'Silt']

export const CROPS = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Sugarcane',
  'Soybean',
  'Groundnut',
  'Mustard',
  'Chickpea (Chana)',
  'Pigeon Pea (Tur)',
  'Tomato',
  'Potato',
  'Onion',
  'Green Chilli',
  'Grapes',
  'Pomegranate',
  'Banana',
  'Jowar',
  'Bajra',
  'Moong',
  'Urad',
]

export const LANGUAGES = ['English', 'Marathi', 'Hindi']

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Expert']

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const DATASET_SEASONS = ['Rainy', 'Winter', 'Summer']

export const GRADES = ['A', 'B', 'C', 'FAQ', 'Premium']

export const PRICE_UNITS = ['₹/quintal', '₹/kg']

export const WATER_SOURCES = ['Rainfed', 'Borewell', 'Canal', 'Open Well', 'Tank/Pond']

export const IRRIGATION_TYPES = ['Drip', 'Sprinkler', 'Flood', 'None']
