import { describe, it, expect } from "vitest";
import { parseCsvBuffer } from "./csvService";

describe("parseCsvBuffer", () => {
  it("parses a well-formed CSV into row objects keyed by header", () => {
    const csv = "Name,Email\nJohn Doe,john@example.com\nJane Doe,jane@example.com\n";
    const { rows, headers } = parseCsvBuffer(Buffer.from(csv));

    expect(headers).toEqual(["Name", "Email"]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ Name: "John Doe", Email: "john@example.com" });
  });

  it("does not assume any fixed column names", () => {
    const csv = "Lead Full Name,Contact Number,Project\nAsha Rao,9876543210,Meridian Tower\n";
    const { rows } = parseCsvBuffer(Buffer.from(csv));

    expect(rows[0]["Lead Full Name"]).toBe("Asha Rao");
    expect(rows[0]["Contact Number"]).toBe("9876543210");
  });

  it("skips fully blank rows", () => {
    const csv = "Name,Email\nJohn,john@example.com\n,\n";
    const { rows } = parseCsvBuffer(Buffer.from(csv));
    expect(rows).toHaveLength(1);
  });

  it("throws on a completely empty CSV", () => {
    expect(() => parseCsvBuffer(Buffer.from("Name,Email\n"))).toThrow(
      "no usable data rows"
    );
  });
});
