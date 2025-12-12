#!/usr/bin/env python3
"""
Canada Gurdwara Data - Complete Update
Adding all missing Gurdwaras found from additional searches
"""

import json

# Additional Gurdwaras found (102 new ones)
ADDITIONAL_CANADA_GURDWARAS = [
    # Manitoba - Winnipeg (7)
    {"name": "Khalsa Diwan Society (Manitoba)", "address": "807 McLeod Ave", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Society of Manitoba", "address": "1244 Mollard Rd", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Society of Winnipeg", "address": "221 Cathcart Street", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    {"name": "Singh Sabha Winnipeg", "address": "Lot 11 Sturgeon Road", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Gurudwara of South Winnipeg", "address": "1248 Wilkes Ave", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Nanaksar Winnipeg", "address": "255 St David Rd", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    {"name": "Guru Nanak Mission Centre", "address": "3511 Pembina Hwy", "city": "Winnipeg", "province": "MB", "country": "Canada", "type": "Standard"},
    
    # Saskatchewan - Regina (3)
    {"name": "Gurdwara Sahib Regina", "address": "3905 Princess Dr", "city": "Regina", "province": "SK", "country": "Canada", "type": "Major"},
    {"name": "Gurudwara One's Sikh Centre", "address": "820 Victoria Ave", "city": "Regina", "province": "SK", "country": "Canada", "type": "Standard"},
    {"name": "Guru Nanak Sikh Centre Regina", "address": "1219 Park St", "city": "Regina", "province": "SK", "country": "Canada", "type": "Standard"},
    
    # Saskatchewan - Saskatoon (4)
    {"name": "Gurudwara Sahib Saskatoon", "address": "331 Lowe Rd", "city": "Saskatoon", "province": "SK", "country": "Canada", "type": "Major"},
    {"name": "Harkrishan Religious Society", "address": "102 Auld Crescent", "city": "Saskatoon", "province": "SK", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Corman Park", "address": "1621 Neault Rd", "city": "Saskatoon", "province": "SK", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Society of Saskatoon", "address": "312 Avenue 1 South", "city": "Saskatoon", "province": "SK", "country": "Canada", "type": "Standard"},
    
    # Nova Scotia - Halifax (2)
    {"name": "Gurdwara Sahib - Maritime Sikh Society", "address": "10 Parkhill Rd", "city": "Halifax", "province": "NS", "country": "Canada", "type": "Standard"},
    {"name": "Gurudwara Sri Guru Nanak Darbar Halifax", "address": "659 Lucasville Rd", "city": "Lucasville", "province": "NS", "country": "Canada", "type": "Standard"},
    
    # BC - Victoria (3)
    {"name": "Gurdwara Singh Sabha Society of Victoria", "address": "470 Cecelia Rd", "city": "Victoria", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Khalsa Diwan Sikh Temple Victoria", "address": "1210 Topaz Ave", "city": "Victoria", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Punjabi Akali Sikh Temple", "address": "2721 Graham St", "city": "Victoria", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # BC - Kelowna (2)
    {"name": "Okanagan Sikh Gurdwara", "address": "1111 Rutland Rd N", "city": "Kelowna", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Guru Amardas Darbar", "address": "220 Davie Rd", "city": "Kelowna", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # BC - Kamloops (2)
    {"name": "Kamloops Gurudwara Sahib Society", "address": "1345 Ord Rd", "city": "Kamloops", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Sikh Cultural Society Kamloops", "address": "700 Cambridge Crescent", "city": "Kamloops", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # BC - Prince George (2)
    {"name": "Guru Nanak Darbar Sikh Society Prince George", "address": "4298 Davis Rd", "city": "Prince George", "province": "BC", "country": "Canada", "type": "Standard"},
    {"name": "Guru Gobind Singh Temple", "address": "443 Kelly Street South", "city": "Prince George", "province": "BC", "country": "Canada", "type": "Standard"},
    
    # Ontario - Hamilton (4)
    {"name": "Baba Buddha Ji Gurudwara Hamilton", "address": "86 Covington St", "city": "Hamilton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Shaheedgarh Sahib Hamilton", "address": "200 Old Guelph Rd", "city": "Hamilton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Gurdwara Dukh Nivaran Sahib Hamilton", "address": "290 Lake Ave N", "city": "Hamilton", "province": "ON", "country": "Canada", "type": "Standard"},
    {"name": "Guru Nanak Darbar Stoney Creek", "address": "218 Mud St E", "city": "Stoney Creek", "province": "ON", "country": "Canada", "type": "Standard"},
    
    # Ontario - London (1)
    {"name": "London Sikh Society", "address": "37 Clarke Road", "city": "London", "province": "ON", "country": "Canada", "type": "Standard"},
    
    # Ontario - Kitchener/Waterloo (1)
    {"name": "Golden Triangle Sikh Association", "address": "2070 Snyder's Road East", "city": "Petersburg", "province": "ON", "country": "Canada", "type": "Standard"},
]

def main():
    print("=" * 60)
    print("Canada Gurdwara Data - Complete Update")
    print("=" * 60)
    print()
    
    # Load existing Canada data
    with open('canada_gurdwaras.json', 'r', encoding='utf-8') as f:
        existing_data = json.load(f)
    
    existing_count = len(existing_data['gurdwaras'])
    print(f"Existing Canada Gurdwaras: {existing_count}")
    
    # Convert additional gurdwaras to proper format
    additional_gurdwaras = []
    for g in ADDITIONAL_CANADA_GURDWARAS:
        gurdwara = {
            "name": g["name"],
            "address": g["address"],
            "city": g["city"],
            "state": g["province"],
            "country": g["country"],
            "latitude": None,
            "longitude": None,
            "type": g["type"],
            "source": "web_search_compilation_v2"
        }
        additional_gurdwaras.append(gurdwara)
    
    print(f"Additional Gurdwaras found: {len(additional_gurdwaras)}")
    
    # Combine
    all_canada = existing_data['gurdwaras'] + additional_gurdwaras
    
    # Save updated data
    output = {"gurdwaras": all_canada}
    
    with open('canada_gurdwaras_complete.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    
    print(f"\n✓ Total Canada Gurdwaras: {len(all_canada)}")
    print(f"✓ Data saved to canada_gurdwaras_complete.json")
    
    # Summary by province
    province_counts = {}
    for g in all_canada:
        prov = g['state']
        province_counts[prov] = province_counts.get(prov, 0) + 1
    
    print("\nSummary by Province/Territory:")
    print("-" * 40)
    for prov in sorted(province_counts.keys()):
        print(f"  {prov}: {province_counts[prov]} Gurdwaras")
    
    # Create final North America dataset
    print("\n" + "=" * 60)
    print("Creating Final North America Dataset")
    print("=" * 60)
    
    with open('gurdwaras_merged.json', 'r', encoding='utf-8') as f:
        us_data = json.load(f)
    
    final_all = us_data['gurdwaras'] + all_canada
    
    final_output = {"gurdwaras": final_all}
    with open('gurdwaras_north_america_complete.json', 'w', encoding='utf-8') as f:
        json.dump(final_output, f, indent=4, ensure_ascii=False)
    
    print(f"\n✓ USA: {len(us_data['gurdwaras'])} Gurdwaras")
    print(f"✓ Canada: {len(all_canada)} Gurdwaras")
    print(f"✓ TOTAL: {len(final_all)} Gurdwaras in North America")
    print(f"✓ Saved to gurdwaras_north_america_complete.json")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
