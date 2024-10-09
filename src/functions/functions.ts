import jwt from "jsonwebtoken";

export function verifyStringLength(
  inputString: string,
  maxLength: number
): boolean {
  return inputString.length <= maxLength;
}

export const validateToken = (token: string, roles: string[]) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      const decodedToken = jwt.decode(token) as jwt.JwtPayload;
      if (err) {
        return reject("Invalid token");
      }
      // console.log(decodedToken);
      if (decodedToken && roles.includes(decodedToken.role)) {
        return resolve(decoded);
      }
      reject("Unauthorized role");
    });
  });
};

export const getUsernameFromToken = (token: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        return reject("Invalid token");
      }

      const decodedToken = decoded as jwt.JwtPayload;

      if (decodedToken && decodedToken.username) {
        return resolve(decodedToken.username);
      }

      reject("Username not found in token");
    });
  });
};
