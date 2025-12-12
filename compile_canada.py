#!/usr/bin/env python3
"""
Canada Gurdwara Data Compiler
Compiles all Canada Gurdwara data from searches and WorldGurudwaras
"""

import json

# Data collected from web searches and WorldGurudwaras
CANADA_GURDWARAS = [
    # Surrey, BC (8)
    {"name": "Guru Nanak Sikh Gurdwara", "address": "7050 120 Street", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Major"},
    {"name": "Gurdwara Dukh Nivaran Sahib", "address": "15255 68 Avenue", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Sahib Dasmesh Darbar", "address": "12885 85 Avenue", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Major"},
    {"name": "Sri Guru Singh Sabha Gurdwara", "address": "8115 132 Street", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Sahib Brookside", "address": "8365 140 Street", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Nanaksar", "address": "14210 88th Avenue", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Khalsa Diwan Society", "address": "103-7938 128 Street", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Sahib York Centre Society", "address": "#110-7938-128th Street", "city": "Surrey", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # Brampton, ON (10)
    {"name": "Gurdwara Dasmesh Darbar", "address": "4555 Ebenezer Road", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Major"},
    {"name": "Gurudwara Nanaksar-Brampton", "address": "64 Timberlane Dr", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Sikh Sangat", "address": "32 Regan Rd", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Dookh Nivaaran Gurdwara Saahib", "address": "79 Bramsteele Drive", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Nanaksar Thath Isher Darbar", "address": "9954 The Gore Rd", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sri Gurdwara Jot Parkash Sahib Toronto", "address": "135 Sun Pac Blvd", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sri Guru Nanak Sikh Centre Brampton", "address": "99 Glidden Rd", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Ravidas Sikh Temple", "address": "86 Newport Street", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Heritage Centre", "address": "11796 Airport Rd", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Tapoban Sahib Brampton", "address": "9658 Goreway Dr", "city": "Brampton", "province": "ON", "country": "Canada", "type": "Standard"},
    
    # Mississauga, ON (6)
    {"name": "Ontario Khalsa Darbar (Dixie Gurdwara)", "address": "7080 Dixie Road", "city": "Mississauga", "province": "ON", "country": "Canada", "type": "Major"},
    {"name": "Ramgarhia Association Of Canada", "address": "1623 Gormack Crescent", "city": "Mississauga", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Ramgarhia Sikh Society", "address": "4109 Dursley Court", "city": "Mississauga", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sri Guru Singh Sabha Malton", "address": "7280 Airport Road", "city": "Mississauga", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Siri Guru Singh Sabha", "address": "7049 Chigwell Court", "city": "Mississauga", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Shiromani Sikh Sangat", "address": "2377 Dunwin Drive", "city": "Mississauga", "province": "ON", "country": "Canada", "type": "Standard"},
    
    # Abbotsford, BC (4)
    {"name": "Gurdwara Kalgidhar Darbar Sahib", "address": "30640 Blueridge Dr", "city": "Abbotsford", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Baba Banda Singh Bahadar", "address": "31631 South Fraser Way", "city": "Abbotsford", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Khalsa Diwan Society Abbotsford", "address": "33094 S. Fraser Way", "city": "Abbotsford", "province": "BC", "country": "Canada", "type": "Major"},
    {"name": "Gurdwara Sachkhand Isher Darbar Abbotsford", "address": "32839 Downes Rd", "city": "Abbotsford", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # Toronto, ON (7)
    {"name": "Sikh Spiritual Centre Toronto", "address": "9 Carrier Dr", "city": "Etobicoke", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sri Guru Singh Sabha Toronto", "address": "331 Old Weston Rd", "city": "York", "province": "ON", "country": "Canada", "type": "Major"},
    {"name": "Shromani Sikh Sangat", "address": "269 Pape Ave", "city": "Toronto", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Gursikh Sabha Canada", "address": "905 Middlefield Rd", "city": "Scarborough", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Nanaksar Gurdwara Toronto", "address": "1995 Kipling Avenue", "city": "Etobicoke", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Dharma Of Canada (Guru Ram Das Ashram)", "address": "348 Palmerston Blvd", "city": "Toronto", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "North York Sikh Temple", "address": "2400 Finch W", "city": "North York", "province": "ON", "country": "Canada", "type": "Standard"},
    
    # Vancouver, BC (2)
    {"name": "Akali Singh Sikh Society", "address": "1890 Skeena St", "city": "Vancouver", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Khalsa Diwan Society Vancouver", "address": "8000 Ross Street", "city": "Vancouver", "province": "BC", "country": "Canada", "type": "Major"},
    
    # Richmond, BC (2)
    {"name": "Gurdwara Nanak Niwas (India Cultural Centre)", "address": "8600 No. 5 Road", "city": "Richmond", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Nanaksar Gurdwara Gursikh Temple Richmond", "address": "18691 Westminster Highway", "city": "Richmond", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # Calgary, AB (8)
    {"name": "Dashmesh Culture Centre", "address": "135 Martindale Blvd NE", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Major"},
    {"name": "Gurdwara Darbar Sri Guru Granth Sahib JI", "address": "3710 Westwinds Dr NE #24", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Darbar Sri Guru Granth Sahib JI Calgary", "address": "8730 45 St NE", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Guru Ram Das Darbar", "address": "5225 84 St NE", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "GuruDwara Guru Harkrishan Sahib Ji", "address": "224 Cornergate Row NE", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Guru Ravidass Community Centre", "address": "1835 40 St SE", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Gurudwara Sahib Calgary", "address": "43 Martindale Dr NE", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Society of Calgary", "address": "739 81 St SW", "city": "Calgary", "province": "AB", "country": "Canada", "type": "Standard"},
    
    # Edmonton, AB (7)
    {"name": "Nanaksar Gurdwara Gursikh Temple Edmonton", "address": "1410 Horsehill Road", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Sri Guru Singh Sabha Society Edmonton", "address": "4504 Millwoods Road South", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Major"},
    {"name": "Ramgharia Gurdwara Society", "address": "2606 Millwoods Road East", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Heritage Association Edmonton", "address": "8507-174th Street", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Society Of Alberta", "address": "14211-113rd Avenue", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Dukh Nivaran Sahib Edmonton", "address": "6611 4 Ave SW", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Standard"},
    {"name": "Sri Guru Nanak Sikh Gurdwara of Alberta", "address": "St. Albert Trail", "city": "Edmonton", "province": "AB", "country": "Canada", "type": "Standard"},
    
    # Ottawa, ON (3)
    {"name": "Gurdwara Sahib Ottawa Sikh Society", "address": "25 Gurdwara Road", "city": "Nepean", "province": "ON", "country": "Canada", "type": "Major"},
    {"name": "Ottawa Sikh Gurdwara", "address": "84 Rideau Heights Drive", "city": "Nepean", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Sikh National Archives Gurdwara", "address": "1181 Cecil Avenue", "city": "Ottawa", "province": "ON", "country": "Canada", "type": "Standard"},
    
    # Montreal, QC (10)
    {"name": "Gurdwara Guru Nanak Darbar LaSalle Montreal", "address": "7801 Rue Cordner", "city": "LaSalle", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Gurudwara Sahib Quebec", "address": "2183 Wellington St", "city": "Montreal", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Guru Nanak Darbar Park Extension", "address": "430 Rue Saint-Roch", "city": "Montreal", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Gurudwara Sahib du Grand Montréal", "address": "1155 Hyman St", "city": "Dollard-Des Ormeaux", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Shri Guru Ravidass Temple Gurbani Sagar", "address": "8205 Durocher St", "city": "Montreal", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Nanaksar Montreal", "address": "7325 Rue Ouimet", "city": "Verdun", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Sahib Vaudreuil-Dorion", "address": "2970 Rte Harwood", "city": "Vaudreuil-Dorion", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Le Centre Communautaire Sikh De Montreal", "address": "13088 Gouin Blvd", "city": "Pierrefonds", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Temple Association Lachine", "address": "1091 St Joseph Blvd", "city": "Lachine", "province": "QC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Brahm Bunga Sahib", "address": "5635 Boulevard Grande-Allee", "city": "Brossard", "province": "QC", "country": "Canada", "type": "Standard"},
    
    # Other BC cities
    {"name": "Guru Nanak Sikh Temple Fort St. John", "address": "9915 90 Street", "city": "Fort St. John", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Cariboo Gur Sikh Temple Society", "address": "431 Lewis Dr", "city": "Quesnel", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Temple Duncan", "address": "3210 Sherman Road", "city": "Duncan", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Alberni Valley Gurdawara Society", "address": "4741 Montrose", "city": "Port Alberni", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # Other provinces
    {"name": "New Foundland Sikh Society", "address": "680 Logy Bay Rd", "city": "St. John's", "province": "NL", "country": "Canada", "type": "Standard"},
    {"name": "Gurudwara Akaljot Sahib", "address": "91678 Alaska Hwy", "city": "Whitehorse", "province": "YT", "country": "Canada", "type": "Standard"},
]

def main():
    print("=" * 60)
    print("Canada Gurdwara Data Compiler")
    print("=" * 60)
    print()
    
    # Convert to proper format
    gurdwaras = []
    for g in CANADA_GURDWARAS:
        gurdwara = {
            "name": g["name"],
            "address": g["address"],
            "city": g["city"],
            "state": g["province"],  # Using 'state' field for province to match US format
            "country": g["country"],
            "latitude": None,
            "longitude": None,
            "type": g["type"],
            "source": "web_search_compilation"
        }
        gurdwaras.append(gurdwara)
    
    # Save data
    output = {"gurdwaras": gurdwaras}
    
    with open('canada_gurdwaras.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    
    print(f"✓ Compiled {len(gurdwaras)} Canada Gurdwaras")
    print(f"✓ Data saved to canada_gurdwaras.json")
    
    # Summary by province
    province_counts = {}
    for g in gurdwaras:
        prov = g['state']
        province_counts[prov] = province_counts.get(prov, 0) + 1
    
    print("\nSummary by Province/Territory:")
    print("-" * 40)
    for prov in sorted(province_counts.keys()):
        print(f"  {prov}: {province_counts[prov]} Gurdwaras")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
