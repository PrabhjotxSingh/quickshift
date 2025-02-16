// automapper.config.ts
import { createMapper, Mapper } from "@automapper/core";
import { classes } from "@automapper/classes";
import { registerRequestProfile } from "./user/register-request.profile";
import { userDtoProfile } from "./user/user-dto.profile";
import { companyDtoProfile } from "./company/company-dto.profile";

// automapper.config.ts
export const mapper = createMapper({
	strategyInitializer: classes(),
});

// Register the profiles
registerRequestProfile(mapper);
userDtoProfile(mapper);
companyDtoProfile(mapper);
