import { CorporationNumberValidation } from "@/types/corporationNumberValidation";
import { ProfileDetails } from "@/types/profileDetails";
import { Result } from "@/types/result";

export async function validateCorporationNumber(
  corporationNumber: string,
): Promise<Result<CorporationNumberValidation>> {
  try {
    const resp = await fetch(
      `https://fe-hometask-api.qa.vault.tryvault.com/corporation-number/${corporationNumber}`,
    );

    const body = await extractBody(resp);

    if (!resp.ok) {
      return { data: null, error: body ?? "Network error", status: resp.status };
    }
    return { data: body, error: null, status: resp.status };
  } catch (e) {
    return { data: null, error: e, status: null };
  }
}

interface CreateProfileError {
  message: string;
}

export async function createProfile(
  payload: ProfileDetails,
): Promise<Result<void, CreateProfileError | any>> {
  try {
    const resp = await fetch(`https://fe-hometask-api.qa.vault.tryvault.com/profile-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await extractBody(resp);
    if (!resp.ok) {
      return { data: null, error: body as CreateProfileError, status: resp.status };
    }
    return { data: body, error: null, status: resp.status };
  } catch (e) {
    return { data: null, error: e, status: null };
  }
}

export async function extractBody(resp: Response): Promise<string | object | any> {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // fallback to text
    return text;
  }
}
