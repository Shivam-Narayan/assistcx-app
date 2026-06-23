interface UserSession {
  user: {
    id: string;
    accessToken: string;
    refreshToken: string;
  };
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}
