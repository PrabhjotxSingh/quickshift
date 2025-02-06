// automapper.config.ts
import { createMapper, Mapper } from "@automapper/core";
import { classes } from "@automapper/classes";
import { registerProfile } from "./user/register.profile";
import { userProfile } from "./user/user.profile";

// automapper.config.ts
export const mapper = createMapper({
	strategyInitializer: classes(),
});

// Register the profiles
registerProfile(mapper);
userProfile(mapper);
