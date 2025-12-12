#!/usr/bin/env python3
"""
Wikipedia Gurdwara List Scraper
Extracts data from Wikipedia's List of Gurdwaras in North America
"""

import requests
from bs4 import BeautifulSoup
import json
import re

def scrape_wikipedia_gurdwaras():
    """Scrape Wikipedia's list of Gurdwaras in North America"""
    url = "https://en.wikipedia.org/wiki/List_of_gurdwaras_in_North_America"
    
    print("Fetching Wikipedia list...")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')
    
    gurdwaras = []
    
    # Find all tables (Wikipedia uses tables for lists)
    tables = soup.find_all('table', class_='wikitable')
    
    for table in tables:
        rows = table.find_all('tr')[1:]  # Skip header row
        
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 2:
                continue
            
            # Extract data from cells
            # Wikipedia format varies, but typically: Name | Location | State/Province | Country
            name = cells[0].get_text(strip=True)
            
            # Skip if it's a header or empty
            if not name or name.lower() in ['name', 'gurdwara']:
                continue
            
            location = cells[1].get_text(strip=True) if len(cells) > 1 else ""
            state = cells[2].get_text(strip=True) if len(cells) > 2 else ""
            country = cells[3].get_text(strip=True) if len(cells) > 3 else ""
            
            # Parse location to get city and address
            city = location
            address = ""
            
            # Clean up state abbreviations
            state = state.strip()
            
            # Only include USA entries
            if 'USA' in country or 'United States' in country or state in [
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
            ]:
                gurdwara = {
                    "name": name,
                    "address": address,
                    "city": city,
                    "state": state,
                    "country": "USA",
                    "latitude": None,
                    "longitude": None,
                    "type": "Standard",
                    "source": url
                }
                gurdwaras.append(gurdwara)
    
    return gurdwaras

def main():
    print("=" * 60)
    print("Wikipedia Gurdwara List Scraper")
    print("=" * 60)
    print()
    
    gurdwaras = scrape_wikipedia_gurdwaras()
    
    print(f"\n✓ Found {len(gurdwaras)} Gurdwaras from Wikipedia")
    
    # Save data
    output = {"gurdwaras": gurdwaras}
    
    with open('wikipedia_gurdwaras.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    
    print(f"✓ Data saved to wikipedia_gurdwaras.json")
    
    # Summary by state
    state_counts = {}
    for g in gurdwaras:
        state = g['state']
        state_counts[state] = state_counts.get(state, 0) + 1
    
    print("\nSummary by State:")
    print("-" * 40)
    for state in sorted(state_counts.keys()):
        print(f"  {state}: {state_counts[state]} Gurdwaras")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
