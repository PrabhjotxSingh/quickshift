// automapper.config.ts
import { createMapper, Mapper } from "@automapper/core";
import { classes } from "@automapper/classes";
import { registerRequestProfile } from "./user/register-request.profile";
import { userDtoProfile } from "./user/user-dto.profile";
import { companyDtoProfile } from "./company/company-dto.profile";
import { createCompanyProfile } from "./company/create-company.profile";
import { createJobRequestToJobDtoProfile as createJobRequestProfile } from "./job/create-job.profile";
import { jobDtoProfile } from "./job/job-dto.profile";

// automapper.config.ts
const mapper = createMapper({
	strategyInitializer: classes(),
});

// Register the profiles
registerRequestProfile(mapper);
userDtoProfile(mapper);
companyDtoProfile(mapper);
createCompanyProfile(mapper);
createJobRequestProfile(mapper);
jobDtoProfile(mapper);

export { mapper };
