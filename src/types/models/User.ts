export interface User {
  username: string,
  userId: string,
}

export interface Profile {
  /** can be selected by the user */
  profileName?: string,
  profileId?: string,
}