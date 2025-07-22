import { V1Volume, V1VolumeMount } from '@kubernetes/client-node';

export type ApplicationProtocolType = 'HTTP' | 'GRPC' | 'WS';

export type TransportProtocolType = 'TCP' | 'UDP' | 'SCTP';

export interface AppEditType {
  appName: string;
  imageName: string;
  runCMD: string;
  cmdParam: string;
  replicas: number | '';
  cpu: number;
  memory: number;
  networks: {
    networkName: string;
    portName: string;
    port: number;
    protocol: TransportProtocolType;
    appProtocol: ApplicationProtocolType;
    openPublicDomain: boolean;
    publicDomain: string; //  domainPrefix
    customDomain: string; // custom domain
    domain: string; // Main promoted domain
    nodePort?: number; // nodePort
    openNodePort: boolean; // open nodePort
  }[];
  envs: {
    key: string;
    value: string;
    valueFrom?: any;
  }[];
  secret: {
    use: boolean;
    username: string;
    password: string;
    serverAddress: string;
  };
  configMapList: {
    mountPath: string;
    value: string;
  }[];
  storeList: {
    name: string;
    path: string;
    value: number;
  }[];
  labels: { [key: string]: string };
  volumes: V1Volume[];
  volumeMounts: V1VolumeMount[];
  kind: 'deployment' | 'statefulset';
}
