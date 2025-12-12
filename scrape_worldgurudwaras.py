#!/usr/bin/env python3
"""
WorldGurudwaras.com Scraper - State-by-State
Uses clean URL structure: /united-states-of-america/[state]/
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re

BASE_URL = "https://www.worldgurudwaras.com/united-states-of-america"

# All 50 US states (lowercase, hyphenated for URLs)
US_STATES = [
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana",
    "maine", "maryland", "massachusetts", "michigan", "minnesota",
    "mississippi", "missouri", "montana", "nebraska", "nevada",
    "new-hampshire", "new-jersey", "new-mexico", "new-york",
    "north-carolina", "north-dakota", "ohio", "oklahoma", "oregon",
    "pennsylvania", "rhode-island", "south-carolina", "south-dakota",
    "tennessee", "texas", "utah", "vermont", "virginia", "washington",
    "west-virginia", "wisconsin", "wyoming"
]

# State abbreviation mapping
STATE_ABBREV = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN",
    "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE",
    "nevada": "NV", "new-hampshire": "NH", "new-jersey": "NJ", "new-mexico": "NM",
    "new-york": "NY", "north-carolina": "NC", "north-dakota": "ND", "ohio": "OH",
    "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA", "rhode-island": "RI",
    "south-carolina": "SC", "south-dakota": "SD", "tennessee": "TN", "texas": "TX",
    "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west-virginia": "WV", "wisconsin": "WI", "wyoming": "WY"
}

def extract_gurdwaras_from_state(state_name):
    """Query a specific state and extract all Gurdwara data"""
    url = f"{BASE_URL}/{state_name}/"
    
    try:
        print(f"  Fetching {url}")
        response = requests.get(url, timeout=15)
        
        if response.status_code == 404:
            print(f"  No page found for {state_name}")
            return []
            
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        gurdwaras = []
        
        # Find all Gurdwara entries (they appear as h3 links)
        entries = soup.find_all('h3')
        
        for entry in entries:
            link = entry.find('a')
            if not link:
                continue
                
            name = link.get_text(strip=True)
            detail_url = link.get('href')
            
            # Skip if it's not a gurdwara link
            if not detail_url or 'worldgurudwaras.com' not in detail_url:
                continue
            
            # Get the parent container to find address and coordinates
            container = entry.find_parent()
            if not container:
                continue
            
            # Extract address (usually in a link with Google Maps)
            address_link = container.find('a', href=re.compile(r'google.com/maps'))
            address = address_link.get_text(strip=True) if address_link else ""
            
            # Extract coordinates from Google Maps link
            lat, lng = None, None
            if address_link:
                maps_url = address_link.get('href', '')
                coord_match = re.search(r'destination=([-\d.]+),([-\d.]+)', maps_url)
                if coord_match:
                    lat = float(coord_match.group(1))
                    lng = float(coord_match.group(2))
            
            gurdwara = {
                "name": name,
                "address": address,
                "city": "",  # Will parse from address if needed
                "state": STATE_ABBREV.get(state_name, state_name.upper()),
                "country": "USA",
                "latitude": lat,
                "longitude": lng,
                "type": "Standard",
                "source": detail_url
            }
            
            gurdwaras.append(gurdwara)
        
        return gurdwaras
    
    except Exception as e:
        print(f"  Error querying {state_name}: {e}")
        return []

def main():
    """Main scraper function"""
    all_gurdwaras = []
    
    print("=" * 60)
    print("WorldGurudwaras.com State-by-State Scraper")
    print("=" * 60)
    print(f"\nQuerying {len(US_STATES)} US states...\n")
    
    for state in US_STATES:
        print(f"\n{state.upper().replace('-', ' ')}:")
        gurdwaras = extract_gurdwaras_from_state(state)
        
        if gurdwaras:
            print(f"  ✓ Found {len(gurdwaras)} Gurdwaras")
            all_gurdwaras.extend(gurdwaras)
        else:
            print(f"  - No Gurdwaras found")
        
        # Be respectful - don't hammer the server
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print(f"TOTAL GURDWARAS COLLECTED: {len(all_gurdwaras)}")
    print("=" * 60)
    
    # Save in the format matching gurdwaras_collected.json
    output = {"gurdwaras": all_gurdwaras}
    
    with open('worldgurudwaras_scraped.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    
    print(f"\n✓ Data saved to worldgurudwaras_scraped.json")
    
    # Print summary by state
    print("\nSummary by State:")
    print("-" * 40)
    state_counts = {}
    for g in all_gurdwaras:
        state = g['state']
        state_counts[state] = state_counts.get(state, 0) + 1
    
    for state in sorted(state_counts.keys()):
        print(f"  {state}: {state_counts[state]} Gurdwaras")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
