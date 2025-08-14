"use client";

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import * as yup from "yup";
import { BaseSyntheticEvent, useMemo, useRef } from "react";
import { validateCorporationNumber } from "@/apis/onboarding";
import useApi from "@/hooks/useApi";
import debounce from "lodash.debounce";

interface FormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  corporationNumber: string;
}

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
    phoneNumber: yup
      .string()
      .required("Phone number is required")
      .matches(/^\+1\d{10}$/, "Phone number must start with +1 followed by 10 digits"),
    corporationNumber: yup.string().trim().required("Corporation number is required"),
  });

export default function OnboardingForm() {
  const schema = useMemo(() => getSchema(), []);
  const formHook = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const {
    formState: { errors },
  } = formHook;

  const corpNumRequestIdRef = useRef(0);

  const corpNumValidateApi = useApi(validateCorporationNumber);

  const debouncedValidateCorpNum = useMemo(
    () =>
      debounce(async (value: string) => {
        const currentId = ++corpNumRequestIdRef.current;
        try {
          const res = await corpNumValidateApi.execute(value);
          if (currentId === corpNumRequestIdRef.current) {
            if (!res.valid) {
              formHook.setError("corporationNumber", {
                type: "manual",
                message: "Corporation number is invalid",
              });
            } else {
              formHook.clearErrors("corporationNumber");
            }
          }
        } catch (err) {
          if (currentId === corpNumRequestIdRef.current) {
            formHook.setError("corporationNumber", {
              type: "manual",
              message: "Corporation number is invalid",
            });
          }
        }
      }, 300),
    [corpNumValidateApi.execute, formHook.setError, formHook.clearErrors],
  );

  const onSubmit = (data: FormValues, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    console.log("Form submitted:", data, event);
  };
  const corporationNumberField = formHook.register("corporationNumber");

  return (
    <Container sx={{ mt: 4 }}>
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
          />
          <TextField
            label="Last Name"
            margin="normal"
            {...formHook.register("lastName")}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <TextField
          fullWidth
          label="Phone Number"
          margin="normal"
          {...formHook.register("phoneNumber")}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message}
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
          error={!!errors.corporationNumber}
          helperText={
            corpNumValidateApi.isPending ? "Checking ..." : errors.corporationNumber?.message
          }
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 2 }}
          endIcon={<ArrowForwardIcon />}
        >
          Submit
        </Button>
      </form>
    </Container>
  );
}
