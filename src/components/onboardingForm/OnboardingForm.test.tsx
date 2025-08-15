import { createProfile, validateCorporationNumber } from "@/apis/onboarding";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OnboardingForm from "./OnboardingForm";
import userEvent from "@testing-library/user-event";
import { Result } from "@/types/result";
import { CorporationNumberValidation } from "@/types/corporationNumberValidation";
import { ProfileDetails } from "@/types/profileDetails";

jest.mock("@/apis/onboarding", () => ({
  validateCorporationNumber: jest.fn(),
  createProfile: jest.fn(),
}));

describe("Onboardingform", () => {
  describe("firstName field", () => {
    it("shows first name required", async () => {
      render(<OnboardingForm />);
      const firstNameField = screen.getByTestId("firstName");
      expect(firstNameField).toHaveValue("");

      fireEvent.blur(firstNameField);

      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      });

      await userEvent.type(firstNameField, "Johny123");
      expect(firstNameField).toHaveValue("Johny123");

      fireEvent.blur(firstNameField);

      await waitFor(() => {
        expect(screen.queryByText(/First name is required/i)).not.toBeInTheDocument();
      });
    });

    it("shows no error message when valid first name entered", async () => {
      render(<OnboardingForm />);
      const firstNameField = screen.getByTestId("firstName");
      expect(firstNameField).toHaveValue("");

      await userEvent.type(firstNameField, "Johny123");
      expect(firstNameField).toHaveValue("Johny123");
      fireEvent.blur(firstNameField);

      await waitFor(() => {
        expect(screen.queryByText(/First name is required/i)).not.toBeInTheDocument();
      });
    });

    it("shows error message when first name too long", async () => {
      render(<OnboardingForm />);
      const firstNameField = screen.getByTestId("firstName");
      expect(firstNameField).toHaveValue("");

      await userEvent.type(firstNameField, "JohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohny1");
      expect(firstNameField).toHaveValue("JohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohny1");
      fireEvent.blur(firstNameField);

      await screen.findByText(/First name cannot exceed 50 characters/i);
    });
  });

  describe("lastName field", () => {
    it("shows last name required", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("lastName");
      expect(field).toHaveValue("");

      fireEvent.blur(field);

      await waitFor(() => {
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      });

      await userEvent.type(field, "Johny123");
      expect(field).toHaveValue("Johny123");

      fireEvent.blur(field);

      await waitFor(() => {
        expect(screen.queryByText(/Last name is required/i)).not.toBeInTheDocument();
      });
    });

    it("shows no error message when last name entered", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("lastName");
      expect(field).toHaveValue("");

      await userEvent.type(field, "Johny123");
      expect(field).toHaveValue("Johny123");
      fireEvent.blur(field);

      await waitFor(() => {
        expect(screen.queryByText(/Last name is required/i)).not.toBeInTheDocument();
      });
    });

    it("shows error message when last name too long", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("lastName");
      expect(field).toHaveValue("");

      await userEvent.type(field, "JohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohny1");
      expect(field).toHaveValue("JohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohnyJohny1");
      fireEvent.blur(field);

      await screen.findByText(/Last name cannot exceed 50 characters/i);
    });
  });

  describe("phone field", () => {
    it("shows error for phone missing", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("phone");

      expect(field).toHaveValue("");
      fireEvent.blur(field);
      await screen.findByText(/Phone number is required/i);
    });

    it("shows error for phone invalid", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("phone");

      expect(field).toHaveValue("");
      await userEvent.type(field, "2345");
      expect(field).toHaveValue("2345");

      fireEvent.blur(field);
      await screen.findByText(/Phone number must start with \+1 followed by 10 digits/i);
    });

    it("shows no error message for valid phone", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("phone");

      expect(field).toHaveValue("");
      await userEvent.type(field, "+16470001111");
      expect(field).toHaveValue("+16470001111");

      fireEvent.blur(field);
      expect(screen.queryByText(/Phone number is required/i)).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Phone number must start with \+1 followed by 10 digits/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("corporationNumber field", () => {
    it("calls validation api for corporation number after typing", async () => {
      render(<OnboardingForm />);
      const corpNumInput = screen.getByTestId("corporationNumber");

      await userEvent.type(corpNumInput, "123");
      expect(corpNumInput).toHaveValue("123");

      await waitFor(() => {
        expect(validateCorporationNumber).toHaveBeenCalledWith("123");
      });
    });

    it("shows checking while calling validation for corporation number", async () => {
      render(<OnboardingForm />);
      const corpNumInput = screen.getByTestId("corporationNumber");

      (validateCorporationNumber as jest.Mock).mockReturnValue(new Promise(() => {}));
      await userEvent.type(corpNumInput, "123");
      expect(corpNumInput).toHaveValue("123");

      await waitFor(() => {
        expect(validateCorporationNumber).toHaveBeenCalledWith("123");
      });

      await screen.findByText(/Checking \.\.\./i);
    });

    it("shows message for Invalid Corporation Number", async () => {
      render(<OnboardingForm />);
      const corpNumInput = screen.getByTestId("corporationNumber");

      const invalidRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "123", valid: false, message: "test for invalid" },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue(invalidRes);
      await userEvent.type(corpNumInput, "123");
      expect(corpNumInput).toHaveValue("123");

      await waitFor(() => {
        expect(validateCorporationNumber).toHaveBeenCalledWith("123");
      });

      await screen.findByText("Invalid Corporation Number");
    });

    it("shows no message for valid corporation number", async () => {
      render(<OnboardingForm />);
      const corpNumInput = screen.getByTestId("corporationNumber");

      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "123", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValueOnce(validRes);
      await userEvent.type(corpNumInput, "123");
      expect(corpNumInput).toHaveValue("123");

      await waitFor(() => {
        expect(validateCorporationNumber).toHaveBeenCalledWith("123");
      });

      await waitFor(async () => {
        expect(screen.queryByText("Invalid Corporation Number")).not.toBeInTheDocument();
      });
    });
  });

  describe.only("submit", () => {
    it("submits form successfully", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({ data: "ok", error: null, status: 200 });
      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);
      await screen.findByText(/Successfully submitted form data!/i);
    });

    it("submits form exceptionally due to phone", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Invalid phone number" },
        status: 400,
      });

      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);

      await screen.findByText(/Invalid phone number/i);
      expect(screen.queryByText(/Successfully submitted form data!/i)).not.toBeInTheDocument();
    });

    it("submits form exceptionally due to corporation number", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Invalid corporation number" },
        status: 400,
      });

      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);

      await screen.findByText(/Invalid corporation number/i);
      expect(screen.queryByText(/Successfully submitted form data!/i)).not.toBeInTheDocument();
    });

    it("submits form exceptionally due to first name", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Invalid first name" },
        status: 400,
      });

      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);

      await screen.findByText(/Invalid first name/i);
      expect(screen.queryByText(/Successfully submitted form data!/i)).not.toBeInTheDocument();
    });

    it("submits form exceptionally due to last name", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Invalid last name" },
        status: 400,
      });

      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);

      await screen.findByText(/Invalid last name/i);
      expect(screen.queryByText(/Successfully submitted form data!/i)).not.toBeInTheDocument();
    });

    it("submits form exceptionally due to unknown error", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: "Invalid data" },
        status: 400,
      });

      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);

      await screen.findByText(/Oops, something went wrong/i);
      expect(screen.queryByText(/Successfully submitted form data!/i)).not.toBeInTheDocument();
    });

    it("submits form exceptionally due to unspecified error", async () => {
      render(<OnboardingForm />);
      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "1234567890", valid: true },
        error: null,
        status: 200,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue({ data: { validRes } });
      (createProfile as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
        status: 400,
      });

      const formValues: ProfileDetails = {
        firstName: "John",
        lastName: "Doe",
        phone: "+16470001111",
        corporationNumber: "1234567890",
      };

      const firstNameInput = screen.getByTestId("firstName");
      const lastNameInput = screen.getByTestId("lastName");
      const phoneInput = screen.getByTestId("phone");
      const corpNumInput = screen.getByTestId("corporationNumber");
      const submitButton = screen.getByTestId("submit-button");

      await userEvent.type(firstNameInput, formValues.firstName);
      await userEvent.type(lastNameInput, formValues.lastName);
      await userEvent.type(phoneInput, formValues.phone);
      await userEvent.type(corpNumInput, formValues.corporationNumber);

      expect(firstNameInput).toHaveValue(formValues.firstName);
      expect(lastNameInput).toHaveValue(formValues.lastName);
      expect(phoneInput).toHaveValue(formValues.phone);
      expect(corpNumInput).toHaveValue(formValues.corporationNumber);

      await userEvent.click(submitButton);
      expect(createProfile).toHaveBeenCalledWith(formValues);

      await screen.findByText(/Oops, something went wrong/i);
      expect(screen.queryByText(/Successfully submitted form data!/i)).not.toBeInTheDocument();
    });
  });
});
