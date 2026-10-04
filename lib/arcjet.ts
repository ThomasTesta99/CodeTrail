import { AI_DAILY_MAX, AI_DAILY_WINDOW } from '@/constants';
import { Action, RateLimitResult } from '@/types/types';
import arcjet, { fixedWindow, request } from '@arcjet/next'

const aj = arcjet({
    key: process.env.ARCJET_API_KEY!,
    rules: [],
})

export default aj;

const aiDailyLimiter = aj.withRule(
  fixedWindow({
    mode: 'LIVE',
    window: AI_DAILY_WINDOW,
    max: AI_DAILY_MAX,
    characteristics: ['aiUserId'],
  })
);


export const validateWithArcjet = async (
  fingerprint: string,
  action: Action
): Promise<RateLimitResult> => {
  if (!fingerprint.trim()) {
    return {
      status: "unavailable",
      valid: false,
      message: "This feature is temporarily unavailable. Please try again later.",
    };
  }

  try {
    const rateLimit = aj.withRule(
      fixedWindow({
        mode: "LIVE",
        window: "3m",
        max: 2,
        characteristics: [action],
      })
    );

    const req = await request();

    const decision = await rateLimit.protect(req, {
      [action]: fingerprint,
    } as Record<Action, string>);

    if (decision.isErrored()) {
      console.error(
        "Rate limiter failed:",
        action,
        decision
      );

      return {
        status: "unavailable",
        valid: false,
        message:
          "This feature is temporarily unavailable. Please try again later.",
      };
    }

    if (decision.isDenied()) {
      return {
        status: "denied",
        valid: false,
        message:
          "Rate limit exceeded. Please try again later.",
      };
    }

    if (action === "ai-feedback") {
      const dailyDecision = await aiDailyLimiter.protect(req, {
        aiUserId: fingerprint,
      });

      if (dailyDecision.isErrored()) {
        console.error(
          "AI feedback usage limiter failed:",
          dailyDecision
        );

        return {
          status: "unavailable",
          valid: false,
          message:
            "AI feedback is temporarily unavailable. Please try again later.",
        };
      }

      if (dailyDecision.isDenied()) {
        return {
          status: "denied",
          valid: false,
          message:
            "You have reached your AI feedback usage limit. Please try again later.",
        };
      }
    }

    return {
      status: "allowed",
      valid: true,
      message: "",
    };
  } catch (error) {
    console.error(
      "Rate limit check failed:",
      action,
      error
    );

    return {
      status: "unavailable",
      valid: false,
      message:
        "This feature is temporarily unavailable. Please try again later.",
    };
  }
};

const signInByEmail = arcjet({
  key: process.env.ARCJET_API_KEY!,
  characteristics: ["authEmail"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "5m",
      max: 5,
    }),
  ],
});

const signInByIP = arcjet({
  key: process.env.ARCJET_API_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "5m",
      max: 20,
    }),
  ],
});

const signUpByEmail = arcjet({
  key: process.env.ARCJET_API_KEY!,
  characteristics: ["authEmail"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 3,
    }),
  ],
});

const signUpByIP = arcjet({
  key: process.env.ARCJET_API_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "1h",
      max: 10,
    }),
  ],
});

const passwordResetByEmail = arcjet({
  key: process.env.ARCJET_API_KEY!,
  characteristics: ["authEmail"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "3m",
      max: 2,
    }),
  ],
});

const passwordResetByIP = arcjet({
  key: process.env.ARCJET_API_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "3m",
      max: 10,
    }),
  ],
});

const verificationEmailByEmail = arcjet({
  key: process.env.ARCJET_API_KEY!,
  characteristics: ["authEmail"],
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "3m",
      max: 2,
    }),
  ],
});

const verificationEmailByIP = arcjet({
  key: process.env.ARCJET_API_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      window: "3m",
      max: 10,
    }),
  ],
});

type AuthRateAction =
  | "sign-in"
  | "sign-up"
  | "password-reset"
  | "verify-email";

export const validateAuthRate = async (
  email: string,
  action: AuthRateAction
): Promise<RateLimitResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      status: "unavailable",
      valid: false,
      message: "Authentication is temporarily unavailable. Please try again later.",
    };
  }

  try {
    const req = await request();

    let emailLimiter;
    let ipLimiter;

    switch (action) {
      case "sign-in":
        emailLimiter = signInByEmail;
        ipLimiter = signInByIP;
        break;

      case "sign-up":
        emailLimiter = signUpByEmail;
        ipLimiter = signUpByIP;
        break;

      case "password-reset":
        emailLimiter = passwordResetByEmail;
        ipLimiter = passwordResetByIP;
        break;

      case "verify-email":
        emailLimiter = verificationEmailByEmail;
        ipLimiter = verificationEmailByIP;
        break;
    }

    const emailDecision = await emailLimiter.protect(req, {
      authEmail: normalizedEmail,
    });

    if (emailDecision.isErrored()) {
      console.error(
        "Authentication email rate limiter failed:",
        action,
        emailDecision
      );

      return {
        status: "unavailable",
        valid: false,
        message:
          "Authentication is temporarily unavailable. Please try again later.",
      };
    }

    if (emailDecision.isDenied()) {
      return {
        status: "denied",
        valid: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    const ipDecision = await ipLimiter.protect(req);

    if (ipDecision.isErrored()) {
      console.error(
        "Authentication IP rate limiter failed:",
        action,
        ipDecision
      );

      return {
        status: "unavailable",
        valid: false,
        message:
          "Authentication is temporarily unavailable. Please try again later.",
      };
    }

    if (ipDecision.isDenied()) {
      return {
        status: "denied",
        valid: false,
        message: "Too many attempts. Please try again later.",
      };
    }

    return {
      status: "allowed",
      valid: true,
      message: "",
    };
  } catch (error) {
    console.error(
      "Authentication rate-limit check failed:",
      action,
      error
    );

    return {
      status: "unavailable",
      valid: false,
      message:
        "Authentication is temporarily unavailable. Please try again later.",
    };
  }
};