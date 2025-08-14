import { CorporationNumberValidation } from "@/types/corporationNumberValidation";

export async function validateCorporationNumber(
  corporationNumber: string,
): Promise<CorporationNumberValidation> {
  // TODO: fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        return resolve({
          corporationNumber,
          valid: true,
        });
      }
      return resolve({
        corporationNumber,
        valid: false,
        message: "Invalid corporation number",
      });
    }, 1500);
  });
}
