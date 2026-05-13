export interface JsonWebKey {
  kty: string
  alg: string
  use: string
  kid: string
  k: string
}

export interface JwksResponse {
  keys: JsonWebKey[]
}
