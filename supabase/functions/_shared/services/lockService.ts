export const assertNotLocked = (session: any) => {
  if (session.locked) {
    throw {
      code: "SESSION_LOCKED",
      message: "Session is currently locked"
    };
  }
};
