export interface User {
  name: string,
  id: string,
  email: string,
}

export interface Profile {
  /** can be selected by the user */
  profileName?: string,
  profileId?: string,
}