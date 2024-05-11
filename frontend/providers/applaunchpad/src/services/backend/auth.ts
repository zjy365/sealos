import { IncomingHttpHeaders } from 'http';
import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

export const getUserKubeConfig = () => {
  const kc = new KubeConfig();
  kc.loadFromCluster();
  const config = kc.exportConfig();
  return config;
};

export const getUserKubeConfigMock = () => {
  const temp = `
  apiVersion: v1
  clusters:
  - cluster:
      certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUM2VENDQWRHZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQ0FYRFRJME1ERXpNVEE1TVRFeU9Wb1lEekl4TWpRd01UQTNNRGt4TVRJNVdqQVZNUk13RVFZRApWUVFERXdwcmRXSmxjbTVsZEdWek1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBCndZeTcxamFzcm5FVlA1TmlSZDJJTWJyN0ZXSlFYd1p3Y3pFUnh4UzROOWRYamtOWXdKRUs0VU4wNGZkbzRxd3kKNnVXVVZ3WDZqYWJDRjU0NlV4dWE4Tk02SVZqRVNKTlI1aDByOXFmU0hXaStBVEM0N1BlVW1VdnZJcGkveXZ1NgpzRjJZVEtjeVgxUGlGOEFuMzJNMDVLYmx4WUVTTEhCV3lDcndDUHZ4QStvejE0eHlBdEJXa21tb2VOVEhnbkRKCnFYVXJ2aXhNNFdIcjdqNzZwZ05LeVF3OEJJcmpkUG9oOUFPZlpGOXhqUWphZ2szaTVnK0tyS2JYVUtuSDh2ZloKTExJNmVYV05XQUFuTW5XM0J1bjJHTFU2WStzNytPYzlkUDVubXM3cVNlRXJMQXJlZlNBSG5YaW1UZlNyd2hhRgpEUDcvRWo5UThkK0tuOEtla2ZjaHF3SURBUUFCbzBJd1FEQU9CZ05WSFE4QkFmOEVCQU1DQXFRd0R3WURWUjBUCkFRSC9CQVV3QXdFQi96QWRCZ05WSFE0RUZnUVVtRXJlL3NuZ0MyUW95bDZxTEJsd0Evd3ozcWN3RFFZSktvWkkKaHZjTkFRRUxCUUFEZ2dFQkFBWXpxV3Z4U25ZMjdCTWRoQVdZMnYvUlpFNHVhN3pMY0J0bUdJYkFaR3A4NFVYagp1Y2hUdkM2VDBhVk05T2V2Vm9tM2J6N0oxV3dMSnBVbXZyTFlGbjJXZzUwRTJBMTZzWVU5a2dLNE81S3g0R3M3Ck1GQzJja2pKWnVlSXRlTm0xMGxFUVpGWWUrYi9WRS9yVXBTSXlMUnhmazlBenF2K0RZN3ZMTjNYT1FXcHJsWUgKcUdtSW1nRjZGU3Frb0cwRnJ5ZzZXVXM2elhpYlBGY2ZuRDZyQUsrakJ6UWZNemY4b01YWHh2eE1ONkQvdXNwdQpUM3NhVEVtQlpHbGtseVpobWlObDAzZHd1dkg0S05ydW1mSVJKM0NyMXB5dDVQdm9oSjhNQW5ZQVNFV012c0VTCkdlLytxRjVpVGJsS1d1YVZHSERHWE9PeFB3T2cvNFJwQldqaTd3Yz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
      server: https://192.168.0.55:6443
    name: kubernetes
  contexts:
  - context:
      cluster: kubernetes
      user: kubernetes-admin
    name: kubernetes-admin@kubernetes
  current-context: kubernetes-admin@kubernetes
  kind: Config
  preferences: {}
  users:
  - name: kubernetes-admin
    user:
      client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURGVENDQWYyZ0F3SUJBZ0lJRlk1bTZHd2xWdDh3RFFZSktvWklodmNOQVFFTEJRQXdGVEVUTUJFR0ExVUUKQXhNS2EzVmlaWEp1WlhSbGN6QWdGdzB5TkRBeE16RXdPVEV4TWpsYUdBOHlNVEkwTURFd056QTVNVEV6TWxvdwpOREVYTUJVR0ExVUVDaE1PYzNsemRHVnRPbTFoYzNSbGNuTXhHVEFYQmdOVkJBTVRFR3QxWW1WeWJtVjBaWE10CllXUnRhVzR3Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRRE5JYnJJSVA1RmNFMjYKMXRQaTlWaHRzeGNXN3BNUWlma3ZUNTVXbi9iNnh3ZXh6WEFoMXJ1bjFPL09POWpvVjJtZlF0QjUzMkRyM3FOWQpoajA1WG11UWNFL3FuNzN3OERQZmt0NURhUG9TVE1zOUVFU1dmVkxTbzczcXFua3R5UXBIOWFyTTVQemIrZzUvCnVMRjEwb0dsRzd6R1c3NjlBTFQwbWYxM3JkeEVmTTgzV2ZvMHFIN25vYzN4em5DSUVIUXNzUkNMUGZIUWdXS3AKb3B0YnBySjJSMWNrOXlpNGRWOWZXUStaUVkvaHhsaVF6OTE2TmVmMVlBczdCT3VtQlRjdmlFeUNoSjFMeWF4dgpjZ2xJQzZaVXpPVGwzNXZ2TjVGRE96TzZGemZLU2xpRGMxdi85aCt4OHZ6N2VnZ0w3WnpzYW5WOWdKUWx5Y1lsCkJaanVqL3V2QWdNQkFBR2pTREJHTUE0R0ExVWREd0VCL3dRRUF3SUZvREFUQmdOVkhTVUVEREFLQmdnckJnRUYKQlFjREFqQWZCZ05WSFNNRUdEQVdnQlNZU3Q3K3llQUxaQ2pLWHFvc0dYQUQvRFBlcHpBTkJna3Foa2lHOXcwQgpBUXNGQUFPQ0FRRUFwcDdDSzhSbjdkWG9qcWlHZzFTUjRpcVd4c3Nqa1dqaHE2eUs4dlhLYmdnaG5ja2hTK0RECnFiZ3ZJbUZHeFREVnpmWlVCaW8vNllneFZia24ra0ZTOE9zc0pzZVlZUGdzRFN5czJucjJSaHJ3WGF3TnNMMVAKVWdXV0lTTnU3VWZhUXdqZlpXaTJKdVhENmF0bXNza1hCSU5LT0ZiQXJrQlVNWVJWVXdFSHBvaWdKM1NwTUpuegpjZU1NTUtsRUY0KzQyN2YwdGtGNUpMamRiYjhOTkZRTGZ4TUpGUE9ibTFpUm11SWpQODh5OWlCeC9KNHZmdm95CmpvcG9GY1dKelZTVk5RNVRKSysvOWRCU1VUazNoWDhOcHY5TEZiOHFjL3phc1NibmxUcStnVXE1UjBJTUVGZmcKK084dkRKdGczc0RVTWR6MzBBdGoxU083UVQxeGR2dmgvUT09Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K
      client-key-data: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBelNHNnlDRCtSWEJOdXRiVDR2VlliYk1YRnU2VEVJbjVMMCtlVnAvMitzY0hzYzF3CklkYTdwOVR2emp2WTZGZHBuMExRZWQ5ZzY5NmpXSVk5T1Y1cmtIQlA2cCs5OFBBejM1TGVRMmo2RWt6TFBSQkUKbG4xUzBxTzk2cXA1TGNrS1IvV3F6T1Q4Mi9vT2Y3aXhkZEtCcFJ1OHhsdSt2UUMwOUpuOWQ2M2NSSHpQTjFuNgpOS2grNTZITjhjNXdpQkIwTExFUWl6M3gwSUZpcWFLYlc2YXlka2RYSlBjb3VIVmZYMWtQbVVHUDRjWllrTS9kCmVqWG45V0FMT3dUcnBnVTNMNGhNZ29TZFM4bXNiM0lKU0F1bVZNems1ZCtiN3plUlF6c3p1aGMzeWtwWWczTmIKLy9ZZnNmTDgrM29JQysyYzdHcDFmWUNVSmNuR0pRV1k3by83cndJREFRQUJBb0lCQUcyMm1KdnBhWlhpRnZEVApiY2g1eUs0RGwxbmdpQy9VVzc1K0t3WFIwTnNZRUhsOGszakZ6T0JhOTFlcWtyelI0K0FXY0VKK3d1dmt6Q0RRCnkzWWZsaEJPd2ErUGVKdWhIVjE2dy8zeDY2NVYvRzNRZ1o2cnNOeVFUMGR2bmhocTZtREtlR3ZXSFpmYUNsOHQKZlZ5ekZqd2t0YmF4NHpaYlptMWMzMEJmY092L2o5bGxhUFlObDJqdmsvc1J0UUczLzVDL1owcVFoRDZYd0pCQgp1R2FxbnQ2RmFUaEhnQlJESXRsQ2FaK0Z5a2gwNUpydVJiTG1hb1lQazZSQzZ6QU1TWmMwcFVZWmh5LzBNRXR2Ck04WGZHQ2hpK2FBNVlrSFNrWStJcDdURW4zeEhSTmJtY0JLd05zaTQ1eEdDQk1vaGswVE1XWVNNcWFQL1ZlazMKa1lzZDN5RUNnWUVBM1BLQ0xINVUwektqOGFJM2x1K0pjRHliWkhpcEhOc1dCK1pqY3hsUUFZVHY5TXdGS1BPago0RHhYV2RHU2YxOEp4YVFEdXpXbW1iYS9KWmhyRFFJYU84clVHNXI4M0tIT1dOdml2YzBNODhOMDRTYU42dW0wCmc5ZG53ZUF3ZzU3NHV4SjhLT2hrbW1QcFVSdDRUUzVSZUxWdk9tSHpQWnl5VVVOWTRzRDYyL3NDZ1lFQTdhemsKby9ERHo4UjdlUlRxYmhCeFJWOEVTaW00VmRPMDY4QWFxaHlEbE53b3lrY1ByWG0zTG5tSFVBc3IvNXZXVlNzZQpWak9HLzZDQ0p0ZG1tb1Y3STh5M3VPN0l0dXpNVWRzRkxaWkNkV1hoVGZUQ0hmY2grc3Z6d3J2UEFuU1lrU2ZaClVraTdxbGROQXJXNS9sR3dKSVRQUDA3T2FRWGl0anFJTkJsUC9OMENnWUVBa1d0VFhmRnY1dWxIbWZ2SVZxRWwKZGllTnB0ejdnVEI1R1kzN0dvQW9kamVHcnptd2s3bDN2Rmc2cmJVUGxLRjZqd2hhSkZjMVphb3Z1SkRPdEdzVAoxUkt6ODg5WWFlWmRKNExoZzBaNEplQVpCeThXN093UWtVMnV6cDI5a0lPSzlhVSs3clcxc1IvZEtqTElSUlFkCkx6TkxGOFBzRWpzVjZnSkhlRWJIVlEwQ2dZQkt0d0VoTUR5K0FhdzNBZ1k0RjE4a1NaeFZuQXZnbnk3T3RaTXMKU3M1cWExTS9VMXR3VTBUc2pUT21TL3pHMjd4akJhMEJ1QzBHQ3ZVZk5MT0NlOWVjQjJ6eDY4NlpBcE93WDhPZQo4dzl0VEZ1cFgvbnQ1WlIrL01KaVF4dnVUNnp1WkxLQ2xXNjVPN3h2ejZUcWQ4K0JpMmFESmtqbzV2ckFBbUp5CnprcEEyUUtCZ0NYbDFCOG1UbDlXaE54QkoyM1N0Q3d0bTFSWjNxdmNGZ1dCT3hnL2FMRWhuREdBK1NVajh6c1cKZG9lVWZSdnl6V3FoOTNCbVdxR2plRTVWQW5PcFhhSU1GVGJsbVBKRWFLSDd4OUcxQ1FTdldwZjZLamtRZTFmRApmN2tCZExqMndvb0gzYVJDb0hkMy8zNzFBRzhIZldlQjlWU2JMV1g2RGxLR25RK0ExNTl2Ci0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==`;

  return temp;
};

export const authSession = async (header: IncomingHttpHeaders) => {
  if (!header) return Promise.reject('unAuthorization');
  const authorization =
    process.env.NODE_ENV === 'development' ? getUserKubeConfigMock() : getUserKubeConfig();
  if (!authorization) return Promise.reject('unAuthorization');

  try {
    const kubeConfig = decodeURIComponent(authorization);
    return Promise.resolve(kubeConfig);
  } catch (err) {
    return Promise.reject('unAuthorization');
  }
};
