interface Targets {
  [key: string]: Function
}

export default interface Promisify {
  (target: Function, ctx?: any): Function

  all(targets: Targets, ctx?: any): Targets

  some(targets: Targets, list: string[], ctx?: any): Targets

  except(targets: Targets, list: string[], ctx?: any): Targets
}
