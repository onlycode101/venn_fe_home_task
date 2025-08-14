"use client";

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import * as yup from "yup";
import { BaseSyntheticEvent } from "react";
import { validateCorporationNumber } from "@/apis/onboarding";

interface FormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  corporationNumber: string;
}

const schema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  corporationNumber: yup
    .string()
    .required("Corporation number is required")
    .test("is-valid-corporation-number", "Corporation number is invalid", async (value) => {
      // todo: change to use validate in form so to handle the pending state
      console.log("checking ", value);
      const result = await validateCorporationNumber(value);
      if (result.valid) {
        return true;
      } else {
        return false;
      }
    }),
});

export default function OnboardingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormValues, event?: BaseSyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    console.log("Form submitted:", data, event);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ width: "100%", textAlign: "center" }}>
        Onboarding Form
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box
          sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 4 }}
        >
          <TextField
            label="Frist Name"
            margin="normal"
            {...register("firstName")}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="Last Name"
            margin="normal"
            {...register("lastName")}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <TextField
          fullWidth
          label="Phone Number"
          margin="normal"
          {...register("phoneNumber")}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message}
        />

        <TextField
          fullWidth
          label="Corporation Number"
          margin="normal"
          {...register("corporationNumber")}
          error={!!errors.corporationNumber}
          helperText={errors.corporationNumber?.message}
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
