// automapper.config.ts
import { createMapper, Mapper } from "@automapper/core";
import { classes } from "@automapper/classes";
import { registerRequestProfile } from "./user/register-request.profile";
import { userDtoProfile } from "./user/user-dto.profile";
import { companyDtoProfile } from "./company/company-dto.profile";
import { createCompanyProfile } from "./company/create-company.profile";
import { createShiftRequestToShiftDtoProfile as createShiftRequestProfile } from "./shift/create-shift.profile";
import { shiftDtoProfile } from "./shift/shift-dto.profile";
import { shiftApplicantDtoProfile } from "./shift/shift-applicant-dto.profile";

// automapper.config.ts
const mapper = createMapper({
	strategyInitializer: classes(),
});

// Register the profiles
registerRequestProfile(mapper);
userDtoProfile(mapper);
companyDtoProfile(mapper);
createCompanyProfile(mapper);
createShiftRequestProfile(mapper);
shiftDtoProfile(mapper);
shiftApplicantDtoProfile(mapper);

export { mapper };
