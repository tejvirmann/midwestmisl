#!/usr/bin/env python3
"""
Merge and Deduplicate Gurdwara Data
Combines data from multiple sources and removes duplicates
"""

import json
from difflib import SequenceMatcher

def similarity(a, b):
    """Calculate similarity ratio between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def are_duplicates(g1, g2, threshold=0.85):
    """Check if two gurdwaras are likely duplicates"""
    # Check name similarity
    name_sim = similarity(g1['name'], g2['name'])
    
    # Check if same state
    same_state = g1.get('state', '').upper() == g2.get('state', '').upper()
    
    # Check city similarity if both have cities
    city_sim = 0
    if g1.get('city') and g2.get('city'):
        city_sim = similarity(g1['city'], g2['city'])
    
    # Consider duplicates if:
    # - High name similarity in same state
    # - Or very high name similarity with similar city
    if same_state and name_sim > threshold:
        return True
    if name_sim > 0.9 and city_sim > 0.8:
        return True
    
    return False

def merge_gurdwara_data(g1, g2):
    """Merge two gurdwara entries, preferring more complete data"""
    merged = g1.copy()
    
    # Prefer non-empty values from either source
    for key in ['address', 'city', 'latitude', 'longitude']:
        if not merged.get(key) and g2.get(key):
            merged[key] = g2[key]
    
    # Combine sources
    sources = []
    if g1.get('source'):
        sources.append(g1['source'])
    if g2.get('source') and g2['source'] not in sources:
        sources.append(g2['source'])
    merged['source'] = sources[0] if len(sources) == 1 else ', '.join(sources)
    
    # Prefer "Major" type
    if g1.get('type') == 'Major' or g2.get('type') == 'Major':
        merged['type'] = 'Major'
    
    return merged

def load_json_file(filename):
    """Load gurdwaras from a JSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, dict) and 'gurdwaras' in data:
                return data['gurdwaras']
            elif isinstance(data, list):
                return data
            else:
                return []
    except FileNotFoundError:
        print(f"Warning: {filename} not found")
        return []
    except json.JSONDecodeError:
        print(f"Warning: {filename} is not valid JSON")
        return []

def main():
    print("=" * 60)
    print("Gurdwara Data Merger & Deduplicator")
    print("=" * 60)
    print()
    
    # Load all data sources
    print("Loading data sources...")
    manual = load_json_file('gurdwaras_collected.json')
    worldguru = load_json_file('worldgurudwaras_scraped.json')
    wikipedia = load_json_file('wikipedia_gurdwaras.json')
    
    print(f"  Manual collection: {len(manual)} entries")
    print(f"  WorldGurudwaras:   {len(worldguru)} entries")
    print(f"  Wikipedia:         {len(wikipedia)} entries")
    print(f"  Total before merge: {len(manual) + len(worldguru) + len(wikipedia)}")
    
    # Start with manual collection as base
    merged = manual.copy()
    
    # Add WorldGurudwaras data
    print("\nMerging WorldGurudwaras data...")
    added_from_worldguru = 0
    merged_count = 0
    
    for wg in worldguru:
        # Check if it's a duplicate
        is_dup = False
        for i, existing in enumerate(merged):
            if are_duplicates(wg, existing):
                # Merge the data
                merged[i] = merge_gurdwara_data(existing, wg)
                is_dup = True
                merged_count += 1
                break
        
        if not is_dup:
            merged.append(wg)
            added_from_worldguru += 1
    
    print(f"  Added {added_from_worldguru} new entries")
    print(f"  Merged {merged_count} duplicates")
    
    # Add Wikipedia data
    print("\nMerging Wikipedia data...")
    added_from_wiki = 0
    wiki_merged_count = 0
    
    for wp in wikipedia:
        is_dup = False
        for i, existing in enumerate(merged):
            if are_duplicates(wp, existing):
                merged[i] = merge_gurdwara_data(existing, wp)
                is_dup = True
                wiki_merged_count += 1
                break
        
        if not is_dup:
            merged.append(wp)
            added_from_wiki += 1
    
    print(f"  Added {added_from_wiki} new entries")
    print(f"  Merged {wiki_merged_count} duplicates")
    
    # Sort by state, then city, then name
    merged.sort(key=lambda x: (x.get('state', ''), x.get('city', ''), x['name']))
    
    # Save merged data
    output = {"gurdwaras": merged}
    
    with open('gurdwaras_merged.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=4, ensure_ascii=False)
    
    print("\n" + "=" * 60)
    print(f"FINAL COUNT: {len(merged)} Gurdwaras")
    print("=" * 60)
    print(f"\n✓ Merged data saved to gurdwaras_merged.json")
    
    # Summary by state
    state_counts = {}
    for g in merged:
        state = g.get('state', 'Unknown')
        state_counts[state] = state_counts.get(state, 0) + 1
    
    print("\nSummary by State:")
    print("-" * 40)
    for state in sorted(state_counts.keys()):
        print(f"  {state}: {state_counts[state]} Gurdwaras")
    
    # Data completeness stats
    with_coords = sum(1 for g in merged if g.get('latitude') and g.get('longitude'))
    with_address = sum(1 for g in merged if g.get('address'))
    with_city = sum(1 for g in merged if g.get('city'))
    
    print("\nData Completeness:")
    print("-" * 40)
    print(f"  With coordinates: {with_coords}/{len(merged)} ({100*with_coords/len(merged):.1f}%)")
    print(f"  With address:     {with_address}/{len(merged)} ({100*with_address/len(merged):.1f}%)")
    print(f"  With city:        {with_city}/{len(merged)} ({100*with_city/len(merged):.1f}%)")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
