import { CorporationNumberValidation } from "@/types/corporationNumberValidation";
import { Result } from "@/types/result";

export async function validateCorporationNumber(
  corporationNumber: string,
): Promise<Result<CorporationNumberValidation>> {
  try {
    const resp = await fetch(
      `https://fe-hometask-api.qa.vault.tryvault.com/corporation-number/${corporationNumber}`,
    );
    if (!resp.ok) {
      return { data: null, error: "Network error" };
    }
    const json = await resp.json();
    return { data: json, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}
