#!/usr/bin/env python3
"""
Geocode Gurdwara Addresses
Uses Nominatim (OpenStreetMap) geocoding service - free and no API key required
"""

import json
import time
from urllib.parse import quote
import requests

def geocode_address(name, address, city, state, country):
    """Geocode an address using Nominatim"""
    # Build query string
    parts = []
    if address:
        parts.append(address)
    if city:
        parts.append(city)
    if state:
        parts.append(state)
    if country:
        parts.append(country)
    
    query = ", ".join(parts)
    
    # If no address, try just the name and location
    if not address and name:
        query = f"{name}, {city}, {state}, {country}"
    
    url = f"https://nominatim.openstreetmap.org/search?q={quote(query)}&format=json&limit=1"
    
    headers = {
        'User-Agent': 'GurdwaraMapProject/1.0'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        results = response.json()
        
        if results:
            return float(results[0]['lat']), float(results[0]['lon'])
        return None, None
    except Exception as e:
        print(f"Error geocoding {query}: {e}")
        return None, None

def main():
    print("=" * 60)
    print("Gurdwara Geocoding Service")
    print("=" * 60)
    print()
    
    # Load data
    with open('gurdwaras_north_america_complete.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    gurdwaras = data['gurdwaras']
    total = len(gurdwaras)
    
    print(f"Total Gurdwaras to geocode: {total}")
    print("Using Nominatim (OpenStreetMap) - Free service")
    print("Rate limit: 1 request per second")
    print()
    
    geocoded = 0
    failed = 0
    
    for i, gurdwara in enumerate(gurdwaras, 1):
        # Skip if already has coordinates
        if gurdwara.get('latitude') and gurdwara.get('longitude'):
            print(f"[{i}/{total}] ✓ {gurdwara['name']} - Already geocoded")
            geocoded += 1
            continue
        
        print(f"[{i}/{total}] Geocoding: {gurdwara['name']}, {gurdwara.get('city', '')}, {gurdwara.get('state', '')}")
        
        lat, lon = geocode_address(
            gurdwara['name'],
            gurdwara.get('address', ''),
            gurdwara.get('city', ''),
            gurdwara.get('state', ''),
            gurdwara.get('country', '')
        )
        
        if lat and lon:
            gurdwara['latitude'] = lat
            gurdwara['longitude'] = lon
            print(f"  ✓ Found: {lat:.6f}, {lon:.6f}")
            geocoded += 1
        else:
            print(f"  ✗ Failed to geocode")
            failed += 1
        
        # Respect rate limit (1 request per second for Nominatim)
        if i < total:
            time.sleep(1.1)
    
    print()
    print("=" * 60)
    print(f"Geocoding Complete!")
    print(f"  Success: {geocoded}/{total}")
    print(f"  Failed: {failed}/{total}")
    print("=" * 60)
    
    # Save updated data
    with open('gurdwaras_geocoded.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"\n✓ Saved to gurdwaras_geocoded.json")
    
    # Statistics
    us_count = sum(1 for g in gurdwaras if g['country'] == 'USA')
    ca_count = sum(1 for g in gurdwaras if g['country'] == 'Canada')
    
    print(f"\nDataset Statistics:")
    print(f"  USA: {us_count} Gurdwaras")
    print(f"  Canada: {ca_count} Gurdwaras")
    print(f"  Total: {total} Gurdwaras")

if __name__ == "__main__":
    main()
