interface CorporationNumberValidationBase<T> {
  corporationNumber: string;
  valid: T;
}

type CorporationNumberValid = CorporationNumberValidationBase<true>;

type CorporationNumberInvalid = CorporationNumberValidationBase<false> & {
  message: string;
};

export type CorporationNumberValidation = CorporationNumberValid | CorporationNumberInvalid;
