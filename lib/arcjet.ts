import { AI_DAILY_MAX, AI_DAILY_WINDOW } from '@/constants';
import { Action } from '@/types/types';
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
) => {
  if (!fingerprint.trim()) {
    return {
      valid: false,
      message: 'Invalid rate limit identifier',
    };
  }

  try {
    const rateLimit = aj.withRule(
      fixedWindow({
        mode: 'LIVE',
        window: '3m',
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
        'Rate limiter failed:',
        action
      );

      return {
        valid: false,
        message:
          'This feature is temporarily unavailable. Please try again later.',
      };
    }

    if (decision.isDenied()) {
      return {
        valid: false,
        message:
          'Rate limit exceeded. Please try again later.',
      };
    }

    if (action === 'ai-feedback') {
      const dailyDecision = await aiDailyLimiter.protect(
        req,
        {
          aiUserId: fingerprint,
        }
      );

      if (dailyDecision.isErrored()) {
        console.error(
          'AI feedback usage limiter failed'
        );

        return {
          valid: false,
          message:
            'AI feedback is temporarily unavailable. Please try again later.',
        };
      }

      if (dailyDecision.isDenied()) {
        return {
          valid: false,
          message:
            'You have reached your AI feedback usage limit. Please try again later.',
        };
      }
    }

    return {
      valid: true,
      message: '',
    };

  } catch (error) {
    console.error(
      'Rate limit check failed:',
      action,
      error
    );

    return {
      valid: false,
      message:
        'This feature is temporarily unavailable. Please try again later.',
    };
  }
};

const signInByEmail = arcjet({
    key: process.env.ARCJET_API_KEY!, 
    characteristics: ["authEmail"],
    rules: [
        fixedWindow({
            mode: "LIVE", 
            window: '5m', 
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
})

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

const signUpByIp = arcjet({
    key: process.env.ARCJET_API_KEY!,
    rules: [
        fixedWindow({
        mode: "LIVE",
        window: "1h",
        max: 10,
        }),
    ],
});

export const validateAuthRate = async (
    email: string,
    action: "sign-in" | "sign-up",
) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        return {
            valid: false,
            message: "Please enter a valid email address.",
        };
    }

    try {
        const req = await request();

        const emailLimiter =
            action === "sign-in"
                ? signInByEmail
                : signUpByEmail;

        const ipLimiter =
            action === "sign-in"
                ? signInByIP
                : signUpByIp;

        const emailDecision = await emailLimiter.protect(req, {
            authEmail: normalizedEmail,
        });

        if (emailDecision.isErrored()) {
            console.error(
                "Authentication email rate limiter failed"
            );

            return {
                valid: false,
                message:
                    "Authentication is temporarily unavailable. Please try again later.",
            };
        }

        if (emailDecision.isDenied()) {
            return {
                valid: false,
                message:
                    "Too many attempts. Please try again later.",
            };
        }

        const ipDecision = await ipLimiter.protect(req);
        if (ipDecision.isErrored()) {
            console.error(
                "Authentication IP rate limiter failed"
            );

            return {
                valid: false,
                message:
                    "Authentication is temporarily unavailable. Please try again later.",
            };
        }

        if (ipDecision.isDenied()) {
            return {
                valid: false,
                message:
                    "Too many attempts. Please try again later.",
            };
        }

        return {
            valid: true,
            message: "",
        };
    } catch (error) {
        console.error(
            "Authentication rate-limit check failed",
            error
        );

        return {
            valid: false,
            message:
                "Authentication is temporarily unavailable. Please try again later.",
        };
    }
};