export type Region = {
  accountSvc: string;
  name: {
    zh: string;
    en: string;
  };
  domain: string;
  uid: string;
};
export type RegionClient = {
  name: {
    zh: string;
    en: string;
  };
  uid: string;
};
export type RawRegion = {
  domain: string;
  displayName: string;
  uid: string;
  location: string;
  description: {
    isFree: boolean;
    color?: string;
    prices: {
      name: string;
      unit_price: number;
      unit: string;
    }[];
    serial: string;
    provider: string;
    description: {
      zh: string;
      en: string;
    };
    // paid?: boolean;
  };
};
