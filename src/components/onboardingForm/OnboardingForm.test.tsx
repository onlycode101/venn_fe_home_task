import { validateCorporationNumber } from "@/apis/onboarding";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import OnboardingForm from "./OnboardingForm";
import userEvent from "@testing-library/user-event";
import { Result } from "@/types/result";
import { CorporationNumberValidation } from "@/types/corporationNumberValidation";

jest.mock("@/apis/onboarding", () => ({
  validateCorporationNumber: jest.fn(),
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

  describe("phoneNumber field", () => {
    it("shows error for phoneNumber missing", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("phoneNumber");

      expect(field).toHaveValue("");
      fireEvent.blur(field);
      await screen.findByText(/Phone number is required/i);
    });

    it("shows error for phoneNumber invalid", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("phoneNumber");

      expect(field).toHaveValue("");
      await userEvent.type(field, "2345");
      expect(field).toHaveValue("2345");

      fireEvent.blur(field);
      await screen.findByText(/Phone number must start with \+1 followed by 10 digits/i);
    });

    it("shows no error message for valid phoneNumber", async () => {
      render(<OnboardingForm />);
      const field = screen.getByTestId("phoneNumber");

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

    it("shows message for invalid corporation number", async () => {
      render(<OnboardingForm />);
      const corpNumInput = screen.getByTestId("corporationNumber");

      const invalidRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "123", valid: false, message: "test for invalid" },
        error: null,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValue(invalidRes);
      await userEvent.type(corpNumInput, "123");
      expect(corpNumInput).toHaveValue("123");

      await waitFor(() => {
        expect(validateCorporationNumber).toHaveBeenCalledWith("123");
      });

      await screen.findByText("Corporation number is invalid");
    });

    it("shows no message for valid corporation number", async () => {
      render(<OnboardingForm />);
      const corpNumInput = screen.getByTestId("corporationNumber");

      const validRes: Result<CorporationNumberValidation> = {
        data: { corporationNumber: "123", valid: true },
        error: null,
      };
      (validateCorporationNumber as jest.Mock).mockResolvedValueOnce(validRes);
      await userEvent.type(corpNumInput, "123");
      expect(corpNumInput).toHaveValue("123");

      await waitFor(() => {
        expect(validateCorporationNumber).toHaveBeenCalledWith("123");
      });

      await waitFor(async () => {
        expect(screen.queryByText("Corporation number is invalid")).not.toBeInTheDocument();
      });
    });
  });
});
