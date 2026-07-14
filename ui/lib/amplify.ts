import { Amplify } from "aws-amplify";

const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? "";
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "";
const userPoolClientId =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID ?? "";
const redirectSignIn =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN ?? "http://localhost:3000/api/auth/callback";
const redirectSignOut =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT ?? "http://localhost:3000/login";

export function configureAmplify() {
  Amplify.configure(
    {
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            oauth: {
              domain: cognitoDomain,
              scopes: ["openid", "email", "profile"],
              redirectSignIn: [redirectSignIn],
              redirectSignOut: [redirectSignOut],
              responseType: "code",
            },
          },
        },
      },
    },
    { ssr: true },
  );
}
