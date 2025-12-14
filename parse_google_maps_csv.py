#!/usr/bin/env python3
"""
Parse google-maps-gurdwaras.csv and convert to JSON format
"""
import csv
import json
import os

def parse_csv_to_json(csv_file, output_dir="client/public/data"):
    """Parse CSV and create JSON file"""
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    gurdwaras = []
    
    with open(csv_file, 'r', encoding='utf-8-sig') as f:  # utf-8-sig handles BOM
        reader = csv.DictReader(f)
        
        for row in reader:
            # Get coordinates first - required
            try:
                lat_str = row.get('lat', '').strip()
                lon_str = row.get('lon', '').strip()
                if not lat_str or not lon_str:
                    continue
                lat = float(lat_str)
                lon = float(lon_str)
                # Validate coordinates are reasonable
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    continue
            except (ValueError, TypeError):
                continue
            
            # Get name - original_Title is the primary source (from Google Maps saved places)
            name = (
                row.get('original_Title', '').strip() or
                row.get('name', '').strip() or
                row.get('\ufefforiginal_Title', '').strip()  # Handle BOM if present
            )
            
            # If no name, try to extract from formatted address or original_Note
            if not name:
                formatted = row.get('formatted', '').strip()
                if formatted:
                    # Try to get name from formatted address (first part before comma)
                    name = formatted.split(',')[0].strip()
                if not name:
                    # Last resort: use original_Note first part
                    note = row.get('original_Note', '').strip()
                    if note:
                        name = note.split(',')[0].strip()
            
            # Skip if still no name
            if not name:
                continue
            
            # Get address - original_Note has the address from Google Maps
            # formatted has the geocoded full address
            address = row.get('original_Note', '').strip() or row.get('formatted', '').strip()
            formatted_address = row.get('formatted', '').strip() or address
            
            # Get Google Place URL - original_URL has the Google Maps place link
            place_url = row.get('original_URL', '').strip()
            
            # Build address components from geocoded data
            city = row.get('city', '').strip()
            state = row.get('state', '').strip() or row.get('state_code', '').strip()
            country = row.get('country', '').strip()
            
            gurdwara = {
                "name": name,
                "address": address,
                "city": city,
                "state": state,
                "country": country,
                "latitude": lat,
                "longitude": lon,
                "place_url": place_url,
                "formatted_address": row.get('formatted', '').strip(),
            }
            
            gurdwaras.append(gurdwara)
    
    # Write to JSON file
    output_file = os.path.join(output_dir, "google_maps_gurdwaras.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"gurdwaras": gurdwaras}, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Parsed {len(gurdwaras)} Gurdwaras from CSV")
    print(f"✅ Saved to: {output_file}")
    
    return output_file

if __name__ == "__main__":
    csv_file = "google-maps-gurdwaras.csv"
    if os.path.exists(csv_file):
        parse_csv_to_json(csv_file)
    else:
        print(f"❌ Error: {csv_file} not found")

