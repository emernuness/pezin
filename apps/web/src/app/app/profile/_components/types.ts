/**
 * Types for profile page components.
 */

export interface ProfileFormData {
  displayName: string;
  bio: string;
  slug: string;
  fullName: string;
  cpf: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface ProfileFormActions {
  setDisplayName: (value: string) => void;
  setBio: (value: string) => void;
  setSlug: (value: string) => void;
  setFullName: (value: string) => void;
  setCpf: (value: string) => void;
  setPhone: (value: string) => void;
  setZipCode: (value: string) => void;
  setStreet: (value: string) => void;
  setNumber: (value: string) => void;
  setComplement: (value: string) => void;
  setNeighborhood: (value: string) => void;
  setCity: (value: string) => void;
  setState: (value: string) => void;
}
