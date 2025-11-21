import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import path from "path";

describe("Home Page - Data Validation", () => {
  let mapData: any;

  beforeAll(() => {
    // Read the gurdwara data JSON file
    const dataPath = path.join(
      process.cwd(),
      "client/public/gurdwara_data.json"
    );
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    mapData = JSON.parse(fileContent);
  });

  it("should have valid Sikh cities data structure", () => {
    expect(mapData).toHaveProperty("topSikhCities");
    expect(Array.isArray(mapData.topSikhCities)).toBe(true);
    expect(mapData.topSikhCities.length).toBe(10);
  });

  it("should have valid Gurdwara data structure", () => {
    expect(mapData).toHaveProperty("gurdwaras");
    expect(Array.isArray(mapData.gurdwaras)).toBe(true);
    expect(mapData.gurdwaras.length).toBeGreaterThan(0);
  });

  it("should have all required fields in Sikh cities", () => {
    const requiredFields = [
      "rank",
      "city",
      "country",
      "population_percentage",
      "notes",
      "latitude",
      "longitude",
    ];

    mapData.topSikhCities.forEach((city: any) => {
      requiredFields.forEach((field) => {
        expect(city).toHaveProperty(field);
      });
      // Validate coordinate ranges
      expect(city.latitude).toBeGreaterThanOrEqual(-90);
      expect(city.latitude).toBeLessThanOrEqual(90);
      expect(city.longitude).toBeGreaterThanOrEqual(-180);
      expect(city.longitude).toBeLessThanOrEqual(180);
      // Validate population percentage
      expect(city.population_percentage).toBeGreaterThan(0);
      expect(city.population_percentage).toBeLessThanOrEqual(100);
    });
  });

  it("should have all required fields in Gurdwaras", () => {
    const requiredFields = [
      "name",
      "city",
      "state",
      "country",
      "latitude",
      "longitude",
      "type",
    ];

    mapData.gurdwaras.forEach((gurdwara: any) => {
      requiredFields.forEach((field) => {
        expect(gurdwara).toHaveProperty(field);
      });
      // Validate coordinate ranges
      expect(gurdwara.latitude).toBeGreaterThanOrEqual(-90);
      expect(gurdwara.latitude).toBeLessThanOrEqual(90);
      expect(gurdwara.longitude).toBeGreaterThanOrEqual(-180);
      expect(gurdwara.longitude).toBeLessThanOrEqual(180);
    });
  });

  it("should have unique city rankings", () => {
    const ranks = mapData.topSikhCities.map((city: any) => city.rank);
    const uniqueRanks = new Set(ranks);
    expect(uniqueRanks.size).toBe(ranks.length);
  });

  it("should have valid Gurdwara types", () => {
    const validTypes = ["Major", "Standard"];
    mapData.gurdwaras.forEach((gurdwara: any) => {
      expect(validTypes).toContain(gurdwara.type);
    });
  });

  it("should have Gurdwaras in North America only", () => {
    const validCountries = ["USA", "Canada"];
    mapData.gurdwaras.forEach((gurdwara: any) => {
      expect(validCountries).toContain(gurdwara.country);
    });
  });

  it("should have top Sikh cities in North America", () => {
    const validCountries = ["USA", "Canada"];
    mapData.topSikhCities.forEach((city: any) => {
      expect(validCountries).toContain(city.country);
    });
  });
});
