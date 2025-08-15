"use client";

import { Box, Button, CircularProgress, Container, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import * as yup from "yup";
import { BaseSyntheticEvent, useCallback, useMemo, useRef, useState } from "react";
import { createProfile, validateCorporationNumber } from "@/apis/onboarding";
import useApi from "@/hooks/useApi";
import debounce from "lodash.debounce";
import { ProfileDetails } from "@/types/profileDetails";

const getSchema = () =>
  yup.object({
    firstName: yup
      .string()
      .required("First name is required")
      .max(50, "First name cannot exceed 50 characters"),
    lastName: yup
      .string()
      .required("Last name is required")
      .max(50, "Last name cannot exceed 50 characters"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^\+1\d{10}$/, "Phone number must start with +1 followed by 10 digits"),
    corporationNumber: yup.string().trim().required("Corporation number is required"),
  });

export default function OnboardingForm() {
  const schema = useMemo(() => getSchema(), []);
  const formHook = useForm<ProfileDetails>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const [generalErrorMessage, setGeneralErrorMessage] = useState<string>();
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string>();
  const {
    formState: { errors },
  } = formHook;

  const corpNumValidateApi = useApi(validateCorporationNumber);
  const createApi = useApi(createProfile);

  const corpNumRequestIdRef = useRef(0);

  const debouncedValidateCorpNum = useMemo(
    () =>
      debounce(async (value: string) => {
        const currentId = ++corpNumRequestIdRef.current;
        try {
          const { data } = await corpNumValidateApi.execute(value);
          if (currentId === corpNumRequestIdRef.current) {
            if (!data?.valid) {
              formHook.setError("corporationNumber", {
                type: "manual",
                message: "Invalid Corporation Number",
              });
            } else {
              formHook.clearErrors("corporationNumber");
            }
          }
        } catch (err) {
          if (currentId === corpNumRequestIdRef.current) {
            formHook.setError("corporationNumber", {
              type: "manual",
              message: "Invalid Corporation Number",
            });
          }
        }
      }, 300),
    [corpNumValidateApi.execute, formHook.setError, formHook.clearErrors],
  );

  const handleBESubmitErrorMessage = useCallback((message: string) => {
    if (message.includes("phone")) {
      formHook.setError("phone", { type: "manual", message });
    } else if (message.includes("corporation")) {
      formHook.setError("corporationNumber", { type: "manual", message });
    } else if (message.includes("first name")) {
      formHook.setError("firstName", { type: "manual", message });
    } else if (message.includes("last name")) {
      formHook.setError("lastName", { type: "manual", message });
    } else {
      setGeneralErrorMessage("Oops, something went wrong.");
      setSubmitSuccessMessage("");
    }
  }, []);

  const onSubmit = async (data: ProfileDetails, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    const result = await createApi.execute(data);
    console.log("result", result);
    if (result.status !== 200) {
      if (result.error?.message) {
        handleBESubmitErrorMessage(result.error.message);
      } else {
        setGeneralErrorMessage("Oops, something went wrong.");
        setSubmitSuccessMessage("");
      }
    } else {
      formHook.clearErrors();
      // formHook.reset();
      setSubmitSuccessMessage("Successfully submitted form data!");
      setGeneralErrorMessage("");
    }
  };

  const corporationNumberField = formHook.register("corporationNumber");

  return (
    <Container
      sx={{
        mt: 4,
        border: "1px solid #cccccc",
        borderRadius: "16px",
        padding: "24px",
        width: "600px",
      }}
    >
      <Typography variant="h4" sx={{ width: "100%", textAlign: "center" }}>
        Onboarding Form
      </Typography>

      <form onSubmit={formHook.handleSubmit(onSubmit)} noValidate>
        <Box
          sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 4 }}
        >
          <TextField
            label="Frist Name"
            margin="normal"
            {...formHook.register("firstName")}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            sx={{ flexGrow: 1 }}
            slotProps={{ htmlInput: { "data-testid": "firstName" } }}
          />
          <TextField
            label="Last Name"
            margin="normal"
            {...formHook.register("lastName")}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            sx={{ flexGrow: 1 }}
            slotProps={{ htmlInput: { "data-testid": "lastName" } }}
          />
        </Box>
        <TextField
          fullWidth
          label="Phone Number"
          margin="normal"
          {...formHook.register("phone")}
          error={!!errors.phone}
          helperText={errors.phone?.message}
          slotProps={{ htmlInput: { "data-testid": "phone" } }}
        />

        <TextField
          fullWidth
          label="Corporation Number"
          margin="normal"
          {...corporationNumberField}
          onChange={(e) => {
            corporationNumberField.onChange(e);
            const val = e.target.value;
            if (val) {
              debouncedValidateCorpNum(val);
            }
          }}
          error={corpNumValidateApi.isPending ? false : !!errors.corporationNumber}
          helperText={
            corpNumValidateApi.isPending ? (
              <>
                <CircularProgress color="success" size={"1em"} /> Checking ...
              </>
            ) : (
              errors.corporationNumber?.message
            )
          }
          slotProps={{ htmlInput: { "data-testid": "corporationNumber" } }}
        />

        {generalErrorMessage && (
          <Typography color="error" style={{ marginTop: "8px", marginBottom: "8px" }}>
            {generalErrorMessage}
          </Typography>
        )}

        {submitSuccessMessage && (
          <Typography color="success" style={{ marginTop: "8px", marginBottom: "8px" }}>
            {submitSuccessMessage}
          </Typography>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2, backgroundColor: "#272323ff", textTransform: "none" }}
          endIcon={<ArrowForwardIcon />}
          data-testid="submit-button"
          // disabled={
          //   !isValid || corpNumValidateApi.isPending || !corpNumValidateApi.data?.data?.valid
          // }
          loading={createApi.isPending}
        >
          Submit
        </Button>
      </form>
    </Container>
  );
}
