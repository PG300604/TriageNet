import os
import json
import urllib.request
import urllib.parse
import random

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# 24 Districts of Jharkhand with HQ coordinates
JHARKHAND_DISTRICTS = {
    "Ranchi": {"lat": 23.3441, "lng": 85.3096, "cmo": "Dr. Prabhat Kumar", "phone": "+91-651-2200101"},
    "East Singhbhum (Jamshedpur)": {"lat": 22.8046, "lng": 86.2029, "cmo": "Dr. Sahir Pall", "phone": "+91-657-2431022"},
    "Dhanbad": {"lat": 23.7957, "lng": 86.4304, "cmo": "Dr. C.B. Pratap", "phone": "+91-654-2220303"},
    "Bokaro": {"lat": 23.6693, "lng": 86.1511, "cmo": "Dr. A.B. Prasad", "phone": "+91-654-2420404"},
    "Hazaribagh": {"lat": 23.9925, "lng": 85.3637, "cmo": "Dr. S.P. Singh", "phone": "+91-654-2620505"},
    "Palamu (Daltonganj)": {"lat": 24.0372, "lng": 84.0722, "cmo": "Dr. Anil Kumar", "phone": "+91-656-2220606"},
    "Deoghar": {"lat": 24.4826, "lng": 86.6961, "cmo": "Dr. R.N. Prasad", "phone": "+91-643-2230707"},
    "Giridih": {"lat": 24.1900, "lng": 86.3000, "cmo": "Dr. Siddharth Soman", "phone": "+91-653-2220808"},
    "Dumka": {"lat": 24.2676, "lng": 87.2497, "cmo": "Dr. B.K. Saha", "phone": "+91-643-2220909"},
    "Ramgarh": {"lat": 23.6293, "lng": 85.5167, "cmo": "Dr. Neelam Chaudhary", "phone": "+91-655-2221010"},
    "West Singhbhum (Chaibasa)": {"lat": 22.5517, "lng": 85.8086, "cmo": "Dr. Om Prakash", "phone": "+91-658-2221111"},
    "Koderma": {"lat": 24.4674, "lng": 85.5936, "cmo": "Dr. Parvati Kumari", "phone": "+91-653-2221212"},
    "Chatra": {"lat": 24.2167, "lng": 84.8667, "cmo": "Dr. S.N. Singh", "phone": "+91-654-2221313"},
    "Garhwa": {"lat": 24.1557, "lng": 83.8078, "cmo": "Dr. N.K. Pandey", "phone": "+91-656-2221414"},
    "Latehar": {"lat": 23.7436, "lng": 84.4984, "cmo": "Dr. Dinesh Kumar", "phone": "+91-656-2221515"},
    "Lohardaga": {"lat": 23.4319, "lng": 84.6800, "cmo": "Dr. S.K. Roy", "phone": "+91-652-2221616"},
    "Gumla": {"lat": 22.9989, "lng": 84.5422, "cmo": "Dr. R.K. Soren", "phone": "+91-652-2221717"},
    "Simdega": {"lat": 22.6143, "lng": 84.5097, "cmo": "Dr. A.K. Minz", "phone": "+91-652-2221818"},
    "Khunti": {"lat": 23.0760, "lng": 85.2789, "cmo": "Dr. Lobsang Hembrom", "phone": "+91-652-2221919"},
    "Seraikela Kharsawan": {"lat": 22.7001, "lng": 85.9298, "cmo": "Dr. Vijay Kumar", "phone": "+91-658-2222020"},
    "Jamtara": {"lat": 23.9627, "lng": 86.8021, "cmo": "Dr. S.K. Mishra", "phone": "+91-643-2222121"},
    "Godda": {"lat": 24.8277, "lng": 87.2122, "cmo": "Dr. Anant Jha", "phone": "+91-643-2222222"},
    "Sahibganj": {"lat": 25.2425, "lng": 87.6419, "cmo": "Dr. Ram Subhag", "phone": "+91-643-2222323"},
    "Pakur": {"lat": 24.6346, "lng": 87.8486, "cmo": "Dr. M.K. Bhagat", "phone": "+91-643-2222424"}
}

# Major Landmark Medical Centers in Jharkhand
PRESEED_MAJOR_HOSPITALS = [
    {
        "name": "Rajendra Institute of Medical Sciences (RIMS)",
        "districtName": "Ranchi",
        "facilityTier": "TERTIARY",
        "latitude": 23.3888,
        "longitude": 85.3582,
        "totalGeneralBeds": 1500,
        "availableGeneralBeds": 320,
        "totalIcuBeds": 150,
        "availableIcuBeds": 18,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Cardiologist", "Trauma Surgeon", "Neurologist", "Nephrologist"]
    },
    {
        "name": "MGM Medical College and Hospital",
        "districtName": "East Singhbhum (Jamshedpur)",
        "facilityTier": "TERTIARY",
        "latitude": 22.8258,
        "longitude": 86.2163,
        "totalGeneralBeds": 600,
        "availableGeneralBeds": 110,
        "totalIcuBeds": 60,
        "availableIcuBeds": 8,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Cardiologist", "Trauma Surgeon"]
    },
    {
        "name": "Shahid Nirmal Mahto Medical College Hospital (SNMMCH / PMCH)",
        "districtName": "Dhanbad",
        "facilityTier": "TERTIARY",
        "latitude": 23.8111,
        "longitude": 86.4389,
        "totalGeneralBeds": 550,
        "availableGeneralBeds": 95,
        "totalIcuBeds": 50,
        "availableIcuBeds": 5,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Cardiologist", "Trauma Surgeon"]
    },
    {
        "name": "AIIMS Deoghar",
        "districtName": "Deoghar",
        "facilityTier": "TERTIARY",
        "latitude": 24.4632,
        "longitude": 86.7214,
        "totalGeneralBeds": 750,
        "availableGeneralBeds": 180,
        "totalIcuBeds": 80,
        "availableIcuBeds": 22,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Cardiologist", "Trauma Surgeon", "Neurologist"]
    },
    {
        "name": "Sheikh Bhikari Medical College and Hospital",
        "districtName": "Hazaribagh",
        "facilityTier": "TERTIARY",
        "latitude": 23.9982,
        "longitude": 85.3688,
        "totalGeneralBeds": 500,
        "availableGeneralBeds": 85,
        "totalIcuBeds": 40,
        "availableIcuBeds": 6,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Trauma Surgeon"]
    },
    {
        "name": "Medinirai Medical College and Hospital",
        "districtName": "Palamu (Daltonganj)",
        "facilityTier": "TERTIARY",
        "latitude": 24.0415,
        "longitude": 84.0811,
        "totalGeneralBeds": 450,
        "availableGeneralBeds": 70,
        "totalIcuBeds": 35,
        "availableIcuBeds": 4,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Cardiologist"]
    },
    {
        "name": "Phulo Jhano Medical College and Hospital",
        "districtName": "Dumka",
        "facilityTier": "TERTIARY",
        "latitude": 24.2715,
        "longitude": 87.2530,
        "totalGeneralBeds": 500,
        "availableGeneralBeds": 105,
        "totalIcuBeds": 40,
        "availableIcuBeds": 7,
        "hasVentilator": True,
        "hasTraumaSurgery": True,
        "hasBloodBank": True,
        "hasOxygenGenerator": True,
        "specialists": ["Pulmonologist", "Trauma Surgeon"]
    }
]

def fetch_overpass_hospitals():
    """Query Overpass API for OpenStreetMap hospital nodes in Jharkhand"""
    query = """
    [out:json][timeout:30];
    area["name"="Jharkhand"]["ISO3166-2"="IN-JH"]->.a;
    (
      node["amenity"="hospital"](area.a);
      node["healthcare"="hospital"](area.a);
    );
    out body 150;
    """
    try:
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        req = urllib.request.Request(OVERPASS_URL, data=data, headers={'User-Agent': 'TriageNet/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            elements = res.get('elements', [])
            print(f"Fetched {len(elements)} raw hospital nodes from OpenStreetMap Overpass API.")
            return elements
    except Exception as e:
        print(f"Overpass API call warning: {e}. Will rely on synthetic geographic distribution for CHCs/District centers.")
        return []

def generate_jharkhand_dataset():
    hospitals = list(PRESEED_MAJOR_HOSPITALS)
    existing_names = {h["name"].lower() for h in hospitals}

    # Generate Sadar Hospital for each of the 24 Districts
    for dist_name, coords in JHARKHAND_DISTRICTS.items():
        sadar_name = f"Sadar District Hospital {dist_name.split(' ')[0]}"
        if sadar_name.lower() not in existing_names:
            # Randomize beds based on district tier
            gen_beds = random.randint(150, 300)
            avail_gen = int(gen_beds * random.uniform(0.15, 0.40))
            icu_beds = random.randint(15, 30)
            avail_icu = int(icu_beds * random.uniform(0.05, 0.25))

            hospitals.append({
                "name": sadar_name,
                "districtName": dist_name,
                "facilityTier": "DISTRICT",
                "latitude": round(coords["lat"] + random.uniform(-0.02, 0.02), 4),
                "longitude": round(coords["lng"] + random.uniform(-0.02, 0.02), 4),
                "totalGeneralBeds": gen_beds,
                "availableGeneralBeds": avail_gen,
                "totalIcuBeds": icu_beds,
                "availableIcuBeds": avail_icu,
                "hasVentilator": True,
                "hasTraumaSurgery": random.choice([True, False]),
                "hasBloodBank": True,
                "hasOxygenGenerator": True,
                "specialists": random.sample(["Pulmonologist", "Cardiologist", "Trauma Surgeon"], k=random.randint(1, 2))
            })
            existing_names.add(sadar_name.lower())

        # Generate 2 Sub-Divisional / CHCs per district
        for i in range(1, 3):
            chc_name = f"Community Health Centre (CHC) Block {i} - {dist_name.split(' ')[0]}"
            if chc_name.lower() not in existing_names:
                gen_beds = random.randint(30, 80)
                avail_gen = int(gen_beds * random.uniform(0.20, 0.50))
                icu_beds = random.randint(2, 8)
                avail_icu = int(icu_beds * random.uniform(0.10, 0.40))

                hospitals.append({
                    "name": chc_name,
                    "districtName": dist_name,
                    "facilityTier": "CHC",
                    "latitude": round(coords["lat"] + random.uniform(-0.15, 0.15), 4),
                    "longitude": round(coords["lng"] + random.uniform(-0.15, 0.15), 4),
                    "totalGeneralBeds": gen_beds,
                    "availableGeneralBeds": avail_gen,
                    "totalIcuBeds": icu_beds,
                    "availableIcuBeds": avail_icu,
                    "hasVentilator": random.choice([True, False]),
                    "hasTraumaSurgery": False,
                    "hasBloodBank": False,
                    "hasOxygenGenerator": random.choice([True, False]),
                    "specialists": []
                })
                existing_names.add(chc_name.lower())

    # Try fetching OSM elements to enrich
    osm_nodes = fetch_overpass_hospitals()
    for node in osm_nodes:
        tags = node.get("tags", {})
        raw_name = tags.get("name") or tags.get("name:en")
        if not raw_name or len(raw_name) < 4:
            continue
        if raw_name.lower() in existing_names:
            continue

        lat = node.get("lat")
        lon = node.get("lon")
        if not lat or not lon:
            continue

        # Find closest district HQ
        min_dist = 999
        closest_dist = "Ranchi"
        for dname, dinfo in JHARKHAND_DISTRICTS.items():
            d = ((lat - dinfo["lat"])**2 + (lon - dinfo["lng"])**2)**0.5
            if d < min_dist:
                min_dist = d
                closest_dist = dname

        tier = "CHC"
        if "referral" in raw_name.lower() or "subdivisional" in raw_name.lower() or "sdh" in raw_name.lower():
            tier = "SUB_DIVISIONAL"
        elif "hospital" in raw_name.lower() and "centre" not in raw_name.lower():
            tier = "DISTRICT"

        gen_beds = 120 if tier == "DISTRICT" else (60 if tier == "SUB_DIVISIONAL" else 30)
        icu_beds = 12 if tier == "DISTRICT" else (4 if tier == "SUB_DIVISIONAL" else 2)

        hospitals.append({
            "name": raw_name,
            "districtName": closest_dist,
            "facilityTier": tier,
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "totalGeneralBeds": gen_beds,
            "availableGeneralBeds": int(gen_beds * 0.3),
            "totalIcuBeds": icu_beds,
            "availableIcuBeds": int(icu_beds * 0.25),
            "hasVentilator": tier in ["TERTIARY", "DISTRICT"],
            "hasTraumaSurgery": tier == "TERTIARY",
            "hasBloodBank": tier in ["TERTIARY", "DISTRICT"],
            "hasOxygenGenerator": True,
            "specialists": ["Pulmonologist"] if tier == "DISTRICT" else []
        })
        existing_names.add(raw_name.lower())

    out_data = {
        "state": "Jharkhand",
        "stateCode": "JH",
        "totalDistricts": len(JHARKHAND_DISTRICTS),
        "districts": JHARKHAND_DISTRICTS,
        "totalHospitals": len(hospitals),
        "hospitals": hospitals
    }

    # Ensure output directories exist
    os.makedirs("scripts", exist_ok=True)
    os.makedirs("backend/src/main/resources/seed", exist_ok=True)

    with open("backend/src/main/resources/seed/jharkhand-hospitals.json", "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2)

    with open("scripts/jharkhand-hospitals.json", "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2)

    print(f"Successfully generated Jharkhand Healthcare Seed Dataset with {len(hospitals)} facilities across 24 districts!")

if __name__ == "__main__":
    generate_jharkhand_dataset()
